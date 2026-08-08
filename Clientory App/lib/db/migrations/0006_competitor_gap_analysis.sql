ALTER TABLE "scans" ADD COLUMN "gap_analysis_status" text NOT NULL DEFAULT 'not_started';
ALTER TABLE "scans" ADD COLUMN "gap_analysis_version" integer;

CREATE TABLE "scan_result_entities" (
  "id" serial PRIMARY KEY NOT NULL,
  "scan_result_id" integer NOT NULL,
  "display_name" text NOT NULL,
  "normalized_name" text NOT NULL,
  "rank" integer,
  "evidence_snippet" text NOT NULL,
  "confidence" real NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "scan_result_entities"
  ADD CONSTRAINT "scan_result_entities_scan_result_id_scan_results_id_fk"
  FOREIGN KEY ("scan_result_id") REFERENCES "public"."scan_results"("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE UNIQUE INDEX "scan_result_entities_result_name_unique"
  ON "scan_result_entities" USING btree ("scan_result_id", "normalized_name");
CREATE INDEX "scan_result_entities_result_idx"
  ON "scan_result_entities" USING btree ("scan_result_id");
CREATE INDEX "scan_result_entities_name_idx"
  ON "scan_result_entities" USING btree ("normalized_name");
