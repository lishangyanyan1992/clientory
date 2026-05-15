import { pgTable, serial, timestamp, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";

export const businessUsagePeriodsTable = pgTable(
  "business_usage_periods",
  {
    id: serial("id").primaryKey(),
    businessId: integer("business_id").notNull().references(() => businessesTable.id),
    billingPeriodStart: timestamp("billing_period_start").notNull(),
    billingPeriodEnd: timestamp("billing_period_end").notNull(),
    scansLimit: integer("scans_limit").notNull(),
    scansUsed: integer("scans_used").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("uniq_usage_period_per_business").on(t.businessId, t.billingPeriodStart),
  ],
);

export type BusinessUsagePeriod = typeof businessUsagePeriodsTable.$inferSelect;
export type InsertBusinessUsagePeriod = typeof businessUsagePeriodsTable.$inferInsert;
