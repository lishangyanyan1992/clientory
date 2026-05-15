import { pgTable, serial, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";
import { scansTable } from "./scans";

export const businessUsageEventsTable = pgTable("business_usage_events", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businessesTable.id),
  scanId: integer("scan_id").notNull().references(() => scansTable.id).unique(),
  billingPeriodStart: timestamp("billing_period_start").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BusinessUsageEvent = typeof businessUsageEventsTable.$inferSelect;
export type InsertBusinessUsageEvent = typeof businessUsageEventsTable.$inferInsert;
