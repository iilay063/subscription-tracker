-- Manual migration applied directly via Neon SQL editor (drizzle-kit push
-- emitted spurious DROP CONSTRAINT statements against NOT NULL columns; the
-- additive statements below are what we actually want).
--
-- Idempotent: safe to re-run if any portion already applied.

DO $$ BEGIN
  CREATE TYPE "reminder_kind" AS ENUM ('renewal', 'trial_ending', 'budget_alert');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "reminder_log"
  ADD COLUMN IF NOT EXISTS "kind" "reminder_kind" DEFAULT 'renewal' NOT NULL;

ALTER TABLE "subscription"
  ADD COLUMN IF NOT EXISTS "is_trial" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "trial_ends_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "reminder_lead_days_override" integer;

ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "monthly_budget" numeric(12, 2),
  ADD COLUMN IF NOT EXISTS "budget_alert_sent_for_month" text;
