import crypto from "crypto";
import { db } from "@workspace/db";
import { otpCodesTable, usersTable } from "@workspace/db/schema";
import { eq, and, gte } from "drizzle-orm";

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour for OTP-issued tokens
const SESSION_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days for password login

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

function signToken(payload: string): string {
  const secret = getTokenSecret();
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64url") + "." + hmac;
}

// tokenVersion is embedded so logout (which increments the DB version) immediately
// invalidates all tokens issued before the logout.
export function createEmailToken(email: string, ttlMs = OTP_TOKEN_TTL_MS, tokenVersion = 0): string {
  const payload = JSON.stringify({
    email: email.toLowerCase(),
    ts: Date.now(),
    expiresAt: Date.now() + ttlMs,
    tv: tokenVersion,
  });
  return signToken(payload);
}

// Issues a long-lived (7-day) token for password-based login sessions.
export function createSessionToken(email: string, tokenVersion = 0): string {
  return createEmailToken(email, SESSION_TOKEN_TTL_MS, tokenVersion);
}

export function createVerifiedToken(email: string): string {
  const payload = JSON.stringify({ email: email.toLowerCase(), ts: Date.now(), purpose: "pw" });
  return signToken(payload);
}

export function verifyVerifiedToken(token: string): string | null {
  const secret = getTokenSecret();
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, hmac] = parts;
  const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  const expectedHmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  if (hmac !== expectedHmac) return null;
  try {
    const data = JSON.parse(payload) as { email: string; ts: number; purpose: string };
    if (data.purpose !== "pw") return null;
    if (Date.now() - data.ts > 10 * 60 * 1000) return null;
    return data.email;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(`${salt}:${key.toString("hex")}`);
    });
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(":");
    if (!salt || !key) { resolve(false); return; }
    crypto.scrypt(password, salt, 64, (err, derived) => {
      if (err) reject(err);
      else resolve(crypto.timingSafeEqual(Buffer.from(key, "hex"), derived));
    });
  });
}

// Synchronous HMAC + expiry check only. Use verifySessionToken for full
// revocation-aware verification on authenticated routes.
export function verifyEmailToken(token: string): string | null {
  const secret = getTokenSecret();
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, hmac] = parts;
  const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  const expectedHmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  if (hmac !== expectedHmac) return null;

  try {
    const data = JSON.parse(payload) as { email: string; ts: number; expiresAt?: number };
    const expiry = data.expiresAt ?? (data.ts + OTP_TOKEN_TTL_MS);
    if (Date.now() > expiry) return null;
    return data.email;
  } catch {
    return null;
  }
}

// Full verification: HMAC + expiry + tokenVersion check against DB.
// Returns the verified email or null if invalid/revoked.
export async function verifySessionToken(token: string): Promise<string | null> {
  // First do the cheap synchronous checks.
  const email = verifyEmailToken(token);
  if (!email) return null;

  // Extract the embedded token version.
  const [payloadB64] = token.split(".");
  let embeddedVersion = 0;
  try {
    const data = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as {
      tv?: number;
    };
    embeddedVersion = data.tv ?? 0;
  } catch {
    return null;
  }

  // Compare against the current version in the DB.
  const [user] = await db
    .select({ tokenVersion: usersTable.tokenVersion })
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!user) return null;

  // Tokens without a version (tv=0) or with a stale version are rejected.
  if (embeddedVersion === 0 || embeddedVersion !== user.tokenVersion) return null;

  return email;
}

// Increments tokenVersion, immediately invalidating all existing tokens for
// this user across all devices/sessions.
export async function revokeAllTokens(email: string): Promise<void> {
  await db
    .update(usersTable)
    .set({ tokenVersion: usersTable.tokenVersion + 1 as unknown as number, updatedAt: new Date() })
    .where(eq(usersTable.email, email.toLowerCase()));
}
