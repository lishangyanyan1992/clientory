import { pgTable, text, serial, timestamp, integer, boolean, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";
import { businessesTable } from "./businesses";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "canceled",
  "incomplete",
]);

export const businessSubscriptionsTable = pgTable(
  "business_subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => usersTable.id),
    businessId: integer("business_id").notNull().references(() => businessesTable.id),
    stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
    stripePriceId: text("stripe_price_id").notNull(),
    status: subscriptionStatusEnum("status").notNull().default("incomplete"),
    currentPeriodStart: timestamp("current_period_start").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("one_active_sub_per_business").on(t.businessId).where(sql`${t.status} = 'active'`),
  ],
);

export type BusinessSubscription = typeof businessSubscriptionsTable.$inferSelect;
export type InsertBusinessSubscription = typeof businessSubscriptionsTable.$inferInsert;
