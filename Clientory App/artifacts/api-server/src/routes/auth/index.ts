import { Router, type IRouter } from "express";
import {
  createOtp,
  verifyOtp,
  createEmailToken,
  createVerifiedToken,
  verifyVerifiedToken,
  hashPassword,
  verifyPassword,
} from "../../services/otp";
import { verifyTurnstile, isTurnstileConfigured } from "../../services/turnstile";
import { checkRateLimit, hashIp, getClientIp } from "../../services/rate-limit";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";


const router: IRouter = Router();

const OTP_IP_MAX = 5;
const OTP_IP_WINDOW_MS = 60 * 60 * 1000;
const VERIFY_IP_MAX = 10;
const VERIFY_IP_WINDOW_MS = 15 * 60 * 1000;
const VERIFY_EMAIL_MAX = 5;
const VERIFY_EMAIL_WINDOW_MS = 15 * 60 * 1000;

router.post("/auth/send-otp", async (req, res) => {
  try {
    const { email, turnstileToken } = req.body as { email?: string; turnstileToken?: string };

    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    const clientIp = getClientIp(req);

    if (isTurnstileConfigured()) {
      if (!turnstileToken) {
        res.status(400).json({ error: "CAPTCHA verification is required" });
        return;
      }
      const turnstileResult = await verifyTurnstile(turnstileToken, clientIp);
      if (!turnstileResult.success) {
        res.status(400).json({ error: "CAPTCHA verification failed. Please try again." });
        return;
      }
    }

    const ipKey = `otp:ip:${hashIp(clientIp)}`;
    const rateResult = await checkRateLimit(ipKey, OTP_IP_MAX, OTP_IP_WINDOW_MS);
    if (!rateResult.allowed) {
      res.status(429).json({
        error: "Too many verification requests. Please try again later.",
        retryAfter: Math.ceil((rateResult.resetAt.getTime() - Date.now()) / 1000),
      });
      return;
    }

    const code = await createOtp(email);

    const { sendOtpEmail } = await import("../../services/email");
    await sendOtpEmail(email, code);

    res.json({ success: true, message: "Verification code sent" });
  } catch (err) {
    console.error("send-otp error:", err);
    res.status(500).json({ error: "Failed to send verification code" });
  }
});

router.post("/auth/verify-otp", async (req, res) => {
  try {
    const { email, code } = req.body as { email?: string; code?: string };

    if (!email || !code) {
      res.status(400).json({ error: "Email and code are required" });
      return;
    }

    const clientIp = getClientIp(req);
    const ipRateKey = `verify:ip:${hashIp(clientIp)}`;
    const ipRate = await checkRateLimit(ipRateKey, VERIFY_IP_MAX, VERIFY_IP_WINDOW_MS);
    if (!ipRate.allowed) {
      res.status(429).json({
        error: "Too many attempts. Please try again later.",
        retryAfter: Math.ceil((ipRate.resetAt.getTime() - Date.now()) / 1000),
      });
      return;
    }

    const emailRateKey = `verify:email:${email.toLowerCase()}`;
    const emailRate = await checkRateLimit(emailRateKey, VERIFY_EMAIL_MAX, VERIFY_EMAIL_WINDOW_MS);
    if (!emailRate.allowed) {
      res.status(429).json({
        error: "Too many attempts for this email. Please try again later.",
        retryAfter: Math.ceil((emailRate.resetAt.getTime() - Date.now()) / 1000),
      });
      return;
    }

    const valid = await verifyOtp(email, code);
    if (!valid) {
      res.status(400).json({ error: "Invalid or expired code" });
      return;
    }

    const normalizedEmail = email.toLowerCase();
    const [user] = await db
      .insert(usersTable)
      .values({ email: normalizedEmail, emailVerified: true })
      .onConflictDoUpdate({
        target: usersTable.email,
        set: { emailVerified: true, updatedAt: new Date() },
      })
      .returning();

    const verifiedToken = createVerifiedToken(normalizedEmail);
    res.json({
      success: true,
      verifiedToken,
      hasPassword: !!(user?.passwordHash),
    });
  } catch (err) {
    console.error("verify-otp error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

router.post("/auth/submit-password", async (req, res) => {
  try {
    const { verifiedToken, password } = req.body as { verifiedToken?: string; password?: string };

    if (!verifiedToken || !password) {
      res.status(400).json({ error: "verifiedToken and password are required" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const email = verifyVerifiedToken(verifiedToken);
    if (!email) {
      res.status(400).json({ error: "Session expired. Please verify your email again." });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) {
      res.status(400).json({ error: "User not found. Please verify your email again." });
      return;
    }

    if (user.passwordHash) {
      const correct = await verifyPassword(password, user.passwordHash);
      if (!correct) {
        res.status(400).json({ error: "Incorrect password" });
        return;
      }
    } else {
      const hashed = await hashPassword(password);
      await db
        .update(usersTable)
        .set({ passwordHash: hashed, updatedAt: new Date() })
        .where(eq(usersTable.email, email));
    }

    const emailToken = createEmailToken(email);
    res.json({ success: true, emailToken, userId: String(user.id) });
  } catch (err) {
    console.error("submit-password error:", err);
    res.status(500).json({ error: "Failed to process password" });
  }
});

router.get("/auth/me", async (req, res) => {
  try {
    const emailToken = req.headers["x-email-token"] as string | undefined;
    if (!emailToken) {
      res.status(401).json({ error: "Email verification required" });
      return;
    }
    const { verifyEmailToken } = await import("../../services/otp");
    const verifiedEmail = verifyEmailToken(emailToken);
    if (!verifiedEmail) {
      res.status(401).json({ error: "Invalid or expired email token" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, verifiedEmail));
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    res.json({ email: user.email, isAdmin: user.isAdmin });
  } catch (err) {
    console.error("GET /auth/me error:", err);
    res.status(500).json({ error: "Failed to fetch user info" });
  }
});

export default router;
