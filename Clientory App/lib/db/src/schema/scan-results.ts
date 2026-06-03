import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { scanPromptsTable } from "./scan-prompts";

export const providerEnum = pgEnum("ai_provider", ["openai", "anthropic", "gemini"]);

/** A cited web source returned by a grounded (web-search) answer. */
export type ScanResultSource = { url: string; title?: string };

export const scanResultsTable = pgTable("scan_results", {
  id: serial("id").primaryKey(),
  scanPromptId: integer("scan_prompt_id").notNull().references(() => scanPromptsTable.id),
  provider: providerEnum("provider").notNull(),
  response: text("response").notNull(),
  mentioned: boolean("mentioned").notNull().default(false),
  // Dual-layer scan: `grounded=false` is the parametric "AI memory" pass,
  // `grounded=true` is the web-search "AI answer" pass. Row identity is
  // (scanPromptId, provider, grounded) — two rows per provider per prompt.
  grounded: boolean("grounded").notNull().default(false),
  // Whether web search actually fired (auto mode may skip it). Grounded rows only.
  searched: boolean("searched").notNull().default(false),
  // Cited source URLs from the grounded answer. Null on ungrounded rows.
  sources: jsonb("sources").$type<ScanResultSource[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertScanResultSchema = createInsertSchema(scanResultsTable).omit({ id: true, createdAt: true });
export type InsertScanResult = z.infer<typeof insertScanResultSchema>;
export type ScanResult = typeof scanResultsTable.$inferSelect;
