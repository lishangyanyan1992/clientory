import { pgTable, text, serial, timestamp, real, pgEnum, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { businessesTable } from "./businesses";

export const scanStatusEnum = pgEnum("scan_status", [
  "pending",
  "generating_prompts",
  "scanning",
  "completed",
  "failed",
]);

export const scansTable = pgTable("scans", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  website: text("website"),
  status: scanStatusEnum("status").notNull().default("pending"),
  // Parametric "AI memory" score (ungrounded pass). Kept as `score` for
  // backward compatibility — all existing reads continue to use it.
  score: real("score"),
  // Web-grounded "AI answer" score (grounded pass). Null on legacy scans.
  groundedScore: real("grounded_score"),
  userEmail: text("user_email"),
  ipHash: text("ip_hash"),
  businessId: integer("business_id").references(() => businessesTable.id),
  isFreeReport: boolean("is_free_report").notNull().default(false),
  // Admin-only: a mock scan uses canned provider responses + a canned report
  // (no OpenAI/Anthropic calls). Lets admins exercise the full front-end without
  // burning tokens. Always false for non-admin scans.
  mock: boolean("mock").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertScanSchema = createInsertSchema(scansTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scansTable.$inferSelect;
