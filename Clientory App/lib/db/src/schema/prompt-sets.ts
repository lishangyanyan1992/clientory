import { pgTable, serial, integer, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";

export interface PromptItem {
  id: string;
  category: string;
  text: string;
  sourceVariables: Record<string, unknown>;
  audience?: "individual" | "business" | null;
}

export const promptSetsTable = pgTable("prompt_sets", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businessesTable.id),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  prompts: jsonb("prompts").notNull().$type<PromptItem[]>(),
  // isLocked is ALWAYS true after creation — enforced at the API layer
  isLocked: boolean("is_locked").notNull().default(true),
  substitutionNotes: text("substitution_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PromptSet = typeof promptSetsTable.$inferSelect;
export type InsertPromptSet = typeof promptSetsTable.$inferInsert;
