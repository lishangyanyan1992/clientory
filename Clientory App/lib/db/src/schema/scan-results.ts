import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { scanPromptsTable } from "./scan-prompts";

export const providerEnum = pgEnum("ai_provider", ["openai", "anthropic", "gemini"]);

export const scanResultsTable = pgTable("scan_results", {
  id: serial("id").primaryKey(),
  scanPromptId: integer("scan_prompt_id").notNull().references(() => scanPromptsTable.id),
  provider: providerEnum("provider").notNull(),
  response: text("response").notNull(),
  mentioned: boolean("mentioned").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertScanResultSchema = createInsertSchema(scanResultsTable).omit({ id: true, createdAt: true });
export type InsertScanResult = z.infer<typeof insertScanResultSchema>;
export type ScanResult = typeof scanResultsTable.$inferSelect;
