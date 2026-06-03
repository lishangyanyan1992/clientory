ALTER TABLE "scan_results" ADD COLUMN "grounded" boolean NOT NULL DEFAULT false;
ALTER TABLE "scan_results" ADD COLUMN "searched" boolean NOT NULL DEFAULT false;
ALTER TABLE "scan_results" ADD COLUMN "sources" jsonb;
ALTER TABLE "scans" ADD COLUMN "grounded_score" real;
