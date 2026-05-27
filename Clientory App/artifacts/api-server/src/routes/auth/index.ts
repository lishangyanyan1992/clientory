import { Router, type IRouter } from "express";
import {
  createOtp,
  verifyOtp,
  createEmailToken,
  createSessionToken,
  createVerifiedToken,
  verifyVerifiedToken,
  verifySessionToken,
  revokeAllTokens,
  hashPassword,
  verifyPassword,
} from "../../services/otp";
import { verifyTurnstile, isTurnstileConfigured } from "../../services/turnstile";
import { checkRateLimit, hashIp, getClientIp } from "../../services/rate-limit";
import { logSecurityEvent } from "../../services/security-logger";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { LoginBody, SendOtpBody, VerifyOtpBody, SubmitPasswordBody } from "@workspace/api-zod";


const router: IRouter = Router();

const LOGIN_IP_MAX = 10;
const LOGIN_IP_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_EMAIL_MAX = 5;
const LOGIN_EMAIL_WINDOW_MS = 15 * 60 * 1000;

const OTP_IP_MAX = 5;
const OTP_IP_WINDOW_MS = 60 * 60 * 1000;
const VERIFY_IP_MAX = 10;
const VERIFY_IP_WINDOW_MS = 15 * 60 * 1000;
const VERIFY_EMAIL_MAX = 5;
const VERIFY_EMAIL_WINDOW_MS = 15 * 60 * 1000;

// submit-password is hit once per OTP flow; 10/15 min per IP is generous but prevents brute-force
const SUBMIT_PW_IP_MAX = 10;
const SUBMIT_PW_IP_WINDOW_MS = 15 * 60 * 1000;

router.post("/auth/login", async (req, res) => {
  try {
    const bodyResult = LoginBody.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({ error: bodyResult.error.issues[0]?.message ?? "Email and password are required" });
      return;
    }
    const { email, password } = bodyResult.data;

    const clientIp = getClientIp(req);

    const ipRateKey = `login:ip:${hashIp(clientIp)}`;
    const ipRate = await checkRateLimit(ipRateKey, LOGIN_IP_MAX, LOGIN_IP_WINDOW_MS);
    if (!ipRate.allowed) {
      logSecurityEvent("LOGIN_BLOCKED_RATE_LIMIT", { ip: clientIp, email });
      res.status(429).json({
        error: "Too many login attempts. Please try again later.",
        retryAfter: Math.ceil((ipRate.resetAt.getTime() - Date.now()) / 1000),
      });
      return;
    }

    const normalizedEmail = email.toLowerCase();
    const emailRateKey = `login:email:${normalizedEmail}`;
    const emailRate = await checkRateLimit(emailRateKey, LOGIN_EMAIL_MAX, LOGIN_EMAIL_WINDOW_MS);
    if (!emailRate.allowed) {
      logSecurityEvent("LOGIN_BLOCKED_RATE_LIMIT", { ip: clientIp, email: normalizedEmail });
      res.status(429).json({
        error: "Too many login attempts for this account. Please try again later.",
        retryAfter: Math.ceil((emailRate.resetAt.getTime() - Date.now()) / 1000),
      });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, normalizedEmail));

    if (!user || !user.passwordHash) {
      logSecurityEvent("LOGIN_FAILED", { ip: clientIp, email: normalizedEmail, reason: !user ? "user_not_found" : "no_password" });
      res.status(401).json({
        error: "No password set for this account. Use the one-time code option to sign in.",
        code: "NO_PASSWORD",
      });
      return;
    }

    const correct = await verifyPassword(password, user.passwordHash);
    if (!correct) {
      logSecurityEvent("LOGIN_FAILED", { ip: clientIp, email: normalizedEmail, reason: "wrong_password" });
      res.status(401).json({ error: "Incorrect password." });
      return;
    }

    logSecurityEvent("LOGIN_SUCCESS", { ip: clientIp, email: normalizedEmail });
    const emailToken = createSessionToken(normalizedEmail, user.tokenVersion);
    res.json({ success: true, emailToken, userId: String(user.id) });
  } catch (err) {
    console.error("POST /auth/login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/auth/send-otp", async (req, res) => {
  try {
    const bodyResult = SendOtpBody.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({ error: bodyResult.error.issues[0]?.message ?? "Email is required" });
      return;
    }
    const { email, turnstileToken } = bodyResult.data;

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
      logSecurityEvent("OTP_BLOCKED_RATE_LIMIT", { ip: clientIp, email });
      res.status(429).json({
        error: "Too many verification requests. Please try again later.",
        retryAfter: Math.ceil((rateResult.resetAt.getTime() - Date.now()) / 1000),
      });
      return;
    }

    const code = await createOtp(email);

    const { sendOtpEmail } = await import("../../services/email");
    await sendOtpEmail(email, code);

    logSecurityEvent("OTP_SENT", { ip: clientIp, email });
    res.json({ success: true, message: "Verification code sent" });
  } catch (err) {
    console.error("send-otp error:", err);
    res.status(500).json({ error: "Failed to send verification code" });
  }
});

router.post("/auth/verify-otp", async (req, res) => {
  try {
    const bodyResult = VerifyOtpBody.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({ error: bodyResult.error.issues[0]?.message ?? "Email and code are required" });
      return;
    }
    const { email, code } = bodyResult.data;

    const clientIp = getClientIp(req);
    const ipRateKey = `verify:ip:${hashIp(clientIp)}`;
    const ipRate = await checkRateLimit(ipRateKey, VERIFY_IP_MAX, VERIFY_IP_WINDOW_MS);
    if (!ipRate.allowed) {
      logSecurityEvent("OTP_BLOCKED_RATE_LIMIT", { ip: clientIp, email });
      res.status(429).json({
        error: "Too many attempts. Please try again later.",
        retryAfter: Math.ceil((ipRate.resetAt.getTime() - Date.now()) / 1000),
      });
      return;
    }

    const emailRateKey = `verify:email:${email.toLowerCase()}`;
    const emailRate = await checkRateLimit(emailRateKey, VERIFY_EMAIL_MAX, VERIFY_EMAIL_WINDOW_MS);
    if (!emailRate.allowed) {
      logSecurityEvent("OTP_BLOCKED_RATE_LIMIT", { ip: clientIp, email });
      res.status(429).json({
        error: "Too many attempts for this email. Please try again later.",
        retryAfter: Math.ceil((emailRate.resetAt.getTime() - Date.now()) / 1000),
      });
      return;
    }

    const valid = await verifyOtp(email, code);
    if (!valid) {
      logSecurityEvent("OTP_INVALID", { ip: clientIp, email });
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
    const clientIp = getClientIp(req);
    const ipRateKey = `submit-password:ip:${hashIp(clientIp)}`;
    const ipRate = await checkRateLimit(ipRateKey, SUBMIT_PW_IP_MAX, SUBMIT_PW_IP_WINDOW_MS);
    if (!ipRate.allowed) {
      res.status(429).json({
        error: "Too many attempts. Please try again later.",
        retryAfter: Math.ceil((ipRate.resetAt.getTime() - Date.now()) / 1000),
      });
      return;
    }

    const bodyResult = SubmitPasswordBody.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({ error: bodyResult.error.issues[0]?.message ?? "verifiedToken and password are required" });
      return;
    }
    const { verifiedToken, password } = bodyResult.data;

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
        logSecurityEvent("PASSWORD_SUBMIT_FAILED", { email, reason: "wrong_password" });
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

    const emailToken = createEmailToken(email, undefined, user.tokenVersion);
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

    // Full revocation-aware check — verifySessionToken validates HMAC + expiry + tokenVersion.
    const verifiedEmail = await verifySessionToken(emailToken);
    if (!verifiedEmail) {
      logSecurityEvent("TOKEN_INVALID", { reason: "failed_session_verify" });
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

// Logout — increments tokenVersion, immediately invalidating all existing
// tokens for this user across all devices and sessions.
router.post("/auth/logout", async (req, res) => {
  try {
    const emailToken = req.headers["x-email-token"] as string | undefined;
    if (!emailToken) {
      res.status(401).json({ error: "Email verification required" });
      return;
    }

    const verifiedEmail = await verifySessionToken(emailToken);
    if (!verifiedEmail) {
      logSecurityEvent("TOKEN_INVALID", { reason: "logout_with_invalid_token" });
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    await revokeAllTokens(verifiedEmail);
    logSecurityEvent("LOGOUT", { email: verifiedEmail, ip: getClientIp(req) });

    res.json({ success: true });
  } catch (err) {
    console.error("POST /auth/logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
