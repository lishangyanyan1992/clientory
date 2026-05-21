import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const symptomQueryCacheTable = pgTable("symptom_query_cache", {
  id: serial("id").primaryKey(),
  deliverable: text("deliverable").notNull().unique(),
  symptomQuery: text("symptom_query").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
