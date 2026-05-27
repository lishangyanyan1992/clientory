import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  isAdmin: boolean("is_admin").notNull().default(false),
  passwordHash: text("password_hash"),
  stripeCustomerId: text("stripe_customer_id"),
  freeReportUsedAt: timestamp("free_report_used_at"),
  // Incremented on logout — immediately invalidates all existing tokens for this user.
  tokenVersion: integer("token_version").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
