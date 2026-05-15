import crypto from "crypto";
import { db } from "@workspace/db";
import { scanCacheTable, scansTable } from "@workspace/db/schema";
import { eq, and, gte } from "drizzle-orm";

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function buildCacheKey(
  businessName: string,
  businessType: string,
  location: string,
  email: string,
): string {
  const normalized = [businessName, businessType, location, email]
    .map((s) => s.toLowerCase().trim().replace(/\s+/g, " "))
    .join("|");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export async function findCachedScan(cacheKey: string): Promise<number | null> {
  const cutoff = new Date(Date.now() - CACHE_TTL_MS);

  const rows = await db
    .select({ scanId: scanCacheTable.scanId })
    .from(scanCacheTable)
    .innerJoin(scansTable, eq(scansTable.id, scanCacheTable.scanId))
    .where(
      and(
        eq(scanCacheTable.cacheKey, cacheKey),
        gte(scanCacheTable.createdAt, cutoff),
        eq(scansTable.status, "completed"),
      ),
    );

  return rows.length > 0 ? rows[0].scanId : null;
}

export async function storeCacheEntry(cacheKey: string, scanId: number): Promise<void> {
  await db.insert(scanCacheTable).values({ cacheKey, scanId });
}
