import { createHash } from "crypto";
import { db } from "@workspace/db";
import { rateLimitsTable } from "@workspace/db/schema";
import { eq, and, gte } from "drizzle-orm";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(
  key: string,
  maxCount: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - windowMs);

  const existing = await db
    .select()
    .from(rateLimitsTable)
    .where(
      and(
        eq(rateLimitsTable.key, key),
        gte(rateLimitsTable.windowStart, windowStart),
      ),
    );

  const totalCount = existing.reduce((sum, r) => sum + r.count, 0);

  if (totalCount >= maxCount) {
    const oldestInWindow = existing.reduce(
      (earliest, r) => (r.windowStart < earliest ? r.windowStart : earliest),
      existing[0]?.windowStart ?? new Date(),
    );
    const resetAt = new Date(oldestInWindow.getTime() + windowMs);
    return { allowed: false, remaining: 0, resetAt };
  }

  await db.insert(rateLimitsTable).values({
    key,
    windowStart: new Date(),
    count: 1,
  });

  return {
    allowed: true,
    remaining: maxCount - totalCount - 1,
    resetAt: new Date(Date.now() + windowMs),
  };
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export function getClientIp(req: { ip?: string; socket?: { remoteAddress?: string } }): string {
  return req.ip || req.socket?.remoteAddress || "unknown";
}
