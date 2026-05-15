import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const stripeEventsTable = pgTable("stripe_events", {
  id: serial("id").primaryKey(),
  stripeEventId: text("stripe_event_id").notNull().unique(),
  processedAt: timestamp("processed_at").defaultNow().notNull(),
});

export type StripeEvent = typeof stripeEventsTable.$inferSelect;
