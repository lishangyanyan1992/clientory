import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export interface FirmLocation {
  city: string;
  state: string;
  neighborhood?: string;
  isHQ: boolean;
}

export interface FirmPartner {
  name: string;
  title: string;
  trackIndependently: boolean;
}

export interface FirmCompetitor {
  name: string;
  location?: string;
}

export interface FirmRanking {
  source: string;
  category: string;
  year: number;
}

export interface FirmAuthoritySignals {
  directoryListings: string[];
  publications: string[];
  podcasts: string[];
  conferences: string[];
}

export const businessesTable = pgTable("businesses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  // Legacy fields — kept for backward compat with billing, scans, and subscriptions
  name: text("name").notNull(),
  website: text("website"),
  businessType: text("business_type").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  // New firm profile fields (all nullable — migrated from legacy where mapping is direct)
  legalName: text("legal_name"),
  brandName: text("brand_name"),
  firmType: text("firm_type"),
  yearFounded: integer("year_founded"),
  partners: jsonb("partners").$type<FirmPartner[]>(),
  locations: jsonb("locations").$type<FirmLocation[]>(),
  geographicScope: text("geographic_scope"),
  primaryServices: jsonb("primary_services").$type<string[]>(),
  deliverables: jsonb("deliverables").$type<string[]>(),
  specialties: jsonb("specialties").$type<string[]>(),
  industriesServed: jsonb("industries_served").$type<string[]>(),
  clientStages: jsonb("client_stages").$type<string[]>(),
  decisionMakers: jsonb("decision_makers").$type<string[]>(),
  directCompetitors: jsonb("direct_competitors").$type<FirmCompetitor[]>(),
  rankings: jsonb("rankings").$type<FirmRanking[]>(),
  authoritySignals: jsonb("authority_signals").$type<FirmAuthoritySignals>(),
  topGSCQueries: jsonb("top_gsc_queries").$type<string[]>(),
  clientType: text("client_type"),
  individualServices: jsonb("individual_services").$type<string[]>(),
  individualDeliverables: jsonb("individual_deliverables").$type<string[]>(),
  individualSpecialties: jsonb("individual_specialties").$type<string[]>(),
  businessServices: jsonb("business_services").$type<string[]>(),
  businessDeliverables: jsonb("business_deliverables").$type<string[]>(),
  businessSpecialties: jsonb("business_specialties").$type<string[]>(),
  profileUpdatedAt: timestamp("profile_updated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Business = typeof businessesTable.$inferSelect;
export type InsertBusiness = typeof businessesTable.$inferInsert;
