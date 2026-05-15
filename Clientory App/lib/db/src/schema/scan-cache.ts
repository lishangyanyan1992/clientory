import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { scansTable } from "./scans";

export const scanCacheTable = pgTable("scan_cache", {
  id: serial("id").primaryKey(),
  cacheKey: text("cache_key").notNull(),
  scanId: integer("scan_id").notNull().references(() => scansTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ScanCache = typeof scanCacheTable.$inferSelect;
