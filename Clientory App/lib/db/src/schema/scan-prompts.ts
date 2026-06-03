import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { scansTable } from "./scans";

export const scanPromptsTable = pgTable("scan_prompts", {
  id: serial("id").primaryKey(),
  scanId: integer("scan_id").notNull().references(() => scansTable.id),
  prompt: text("prompt").notNull(),
  category: text("category").notNull(),
  audience: text("audience").$type<"individual" | "business" | null>(),
  // Whether this prompt was actually queried against the providers. Free-tier
  // (isFreeReport) scans run only a 5-prompt sample; the rest are stored with
  // executed=false and surfaced as locked "upgrade to unlock" rows in the report.
  // Paid scans run (and mark executed) every prompt.
  executed: boolean("executed").notNull().default(false),
});

export const insertScanPromptSchema = createInsertSchema(scanPromptsTable).omit({ id: true });
export type InsertScanPrompt = z.infer<typeof insertScanPromptSchema>;
export type ScanPrompt = typeof scanPromptsTable.$inferSelect;
