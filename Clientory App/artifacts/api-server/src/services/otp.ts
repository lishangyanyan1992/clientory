import crypto from "crypto";
import { db } from "@workspace/db";
import { otpCodesTable } from "@workspace/db/schema";
import { eq, and, gte } from "drizzle-orm";

const OTP_EXPIRY_MS = 10 * 60 * 1000;

function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function createOtp(email: string): Promise<string> {
  const code = generateCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await db.insert(otpCodesTable).values({
    email: email.toLowerCase(),
    codeHash,
    expiresAt,
    used: false,
  });

  return code;
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const codeHash = hashCode(code);
  const normalizedEmail = email.toLowerCase();

  const updated = await db
    .update(otpCodesTable)
    .set({ used: true })
    .where(
      and(
        eq(otpCodesTable.email, normalizedEmail),
        eq(otpCodesTable.codeHash, codeHash),
        eq(otpCodesTable.used, false),
        gte(otpCodesTable.expiresAt, new Date()),
      ),
    )
    .returning({ id: otpCodesTable.id });

  return updated.length > 0;
}

function getTokenSecret(): string {
  const secret = process.env.EMAIL_TOKEN_SECRET;
  if (!secret) {
    throw new Error("EMAIL_TOKEN_SECRET environment variable is required");
  }
  return secret;
}

export function createEmailToken(email: string): string {
  const secret = getTokenSecret();
  const payload = JSON.stringify({ email: email.toLowerCase(), ts: Date.now() });
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const token = Buffer.from(payload).toString("base64url") + "." + hmac;
  return token;
}

export function verifyEmailToken(token: string): string | null {
  const secret = getTokenSecret();
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, hmac] = parts;
  const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  const expectedHmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  if (hmac !== expectedHmac) return null;

  try {
    const data = JSON.parse(payload) as { email: string; ts: number };
    const age = Date.now() - data.ts;
    if (age > 60 * 60 * 1000) return null;
    return data.email;
  } catch {
    return null;
  }
}
