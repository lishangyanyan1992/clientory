import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const rateLimitsTable = pgTable("rate_limits", {
  id: serial("id").primaryKey(),
  key: text("key").notNull(),
  windowStart: timestamp("window_start").notNull(),
  count: integer("count").notNull().default(1),
});

export type RateLimit = typeof rateLimitsTable.$inferSelect;
