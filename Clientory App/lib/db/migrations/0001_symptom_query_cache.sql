CREATE TABLE "symptom_query_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"deliverable" text NOT NULL,
	"symptom_query" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "symptom_query_cache_deliverable_unique" UNIQUE("deliverable")
);
