import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { scansTable } from "./scans";

export const scanPromptsTable = pgTable("scan_prompts", {
  id: serial("id").primaryKey(),
  scanId: integer("scan_id").notNull().references(() => scansTable.id),
  prompt: text("prompt").notNull(),
  category: text("category").notNull(),
  audience: text("audience").$type<"individual" | "business" | null>(),
});

export const insertScanPromptSchema = createInsertSchema(scanPromptsTable).omit({ id: true });
export type InsertScanPrompt = z.infer<typeof insertScanPromptSchema>;
export type ScanPrompt = typeof scanPromptsTable.$inferSelect;
