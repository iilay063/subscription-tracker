-- Manual migration applied directly via Neon SQL editor (matching the
-- additive style of 0001). Adds the column needed for on-demand Gmail
-- inbox scanning.
--
-- Idempotent: safe to re-run if any portion already applied.

ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "gmail_last_scanned_at" timestamp with time zone;
