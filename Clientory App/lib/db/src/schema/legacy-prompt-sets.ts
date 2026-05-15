import { pgTable, serial, integer, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";
import type { PromptItem } from "./prompt-sets";

export const legacyPromptSetsTable = pgTable("legacy_prompt_sets", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businessesTable.id),
  originalPromptSetId: integer("original_prompt_set_id"),
  generatedAt: timestamp("generated_at").notNull(),
  prompts: jsonb("prompts").notNull().$type<PromptItem[]>(),
  isLocked: boolean("is_locked").notNull().default(true),
  substitutionNotes: text("substitution_notes"),
  archivedAt: timestamp("archived_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export type LegacyPromptSet = typeof legacyPromptSetsTable.$inferSelect;
