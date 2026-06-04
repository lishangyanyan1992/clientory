import crypto from "crypto";
import { db } from "@workspace/db";
import { scanCacheTable, scansTable, scanPromptsTable, scanResultsTable } from "@workspace/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

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
        // Never serve a "completed" scan that produced no provider results — these
        // are broken/aborted runs (no API calls landed). Serving them shows a bogus
        // 0% report and, worse, suppresses a real re-scan. Require ≥1 stored result.
        sql`exists (
          select 1 from ${scanResultsTable}
          join ${scanPromptsTable} on ${scanPromptsTable.id} = ${scanResultsTable.scanPromptId}
          where ${scanPromptsTable.scanId} = ${scansTable.id}
        )`,
      ),
    );

  return rows.length > 0 ? rows[0].scanId : null;
}

export async function storeCacheEntry(cacheKey: string, scanId: number): Promise<void> {
  await db.insert(scanCacheTable).values({ cacheKey, scanId });
}
