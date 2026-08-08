import {
  index,
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { scanResultsTable } from "./scan-results";

export const scanResultEntitiesTable = pgTable(
  "scan_result_entities",
  {
    id: serial("id").primaryKey(),
    scanResultId: integer("scan_result_id")
      .notNull()
      .references(() => scanResultsTable.id),
    displayName: text("display_name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    rank: integer("rank"),
    evidenceSnippet: text("evidence_snippet").notNull(),
    confidence: real("confidence").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("scan_result_entities_result_name_unique").on(
      table.scanResultId,
      table.normalizedName,
    ),
    index("scan_result_entities_result_idx").on(table.scanResultId),
    index("scan_result_entities_name_idx").on(table.normalizedName),
  ],
);

export type ScanResultEntity = typeof scanResultEntitiesTable.$inferSelect;
export type InsertScanResultEntity =
  typeof scanResultEntitiesTable.$inferInsert;
