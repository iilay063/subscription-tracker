# Subscription Tracker

A web app for tracking recurring subscriptions: what you pay, when you'll
be charged next, and how much you spend per month and year. Email
reminders fire before renewals so users can cancel things they don't use.

## Stack

- Framework: Next.js 15 (App Router) + TypeScript
- Database: Postgres on Neon (serverless)
- ORM: Drizzle
- Auth: Auth.js v5 (Google OAuth)
- Email: Resend
- Currency conversion: exchangerate-api.com (free tier, cached 24h)
- Charts: Recharts
- Styling: Tailwind + shadcn/ui
- Validation: Zod
- Scheduled jobs: Vercel Cron
- Hosting: Vercel

## Architecture

Single Next.js app. Server actions for mutations. Route handlers under
`app/api/cron/*` for Vercel Cron triggers. RSC for reads.

### Domain model

- **User**: auth fields, `preferred_currency` (default USD),
  `reminder_lead_days` (default 3)
- **Category**: user-scoped — name, color, icon
- **Subscription**: user_id, category_id, name, description, cost,
  currency, billing_cycle (monthly | yearly | weekly | custom_days),
  custom_days (nullable), next_billing_date, is_active, started_at,
  cancelled_at, url, notes
- **BillingHistory**: subscription_id, amount, currency,
  amount_in_user_currency, exchange_rate, billed_at
- **ReminderLog**: subscription_id, sent_at, channel, success,
  error_message
- **ExchangeRatesCache**: base_currency, quote_currency, rate, fetched_at

### Core flows (v1)

1. **Onboarding** — sign in with Google → empty dashboard → "add your
   first subscription" CTA
2. **Add subscription** — name, cost, currency, cycle, next billing date,
   category (create on the fly if new)
3. **Dashboard** — monthly total, yearly total, breakdown chart by
   category, upcoming billings in the next 30 days, list of active
   subscriptions sorted by next billing date
4. **Cancel** — mark cancelled, don't delete; cancelled view shows
   history and total amount paid lifetime
5. **Reminder cron** — daily at 09:00 UTC, find subscriptions billing
   in `user.reminder_lead_days` days, send email via Resend, write to
   ReminderLog
6. **Billing tick cron** — daily, for subscriptions where
   `next_billing_date <= today`: push a row to BillingHistory and
   advance `next_billing_date` by one cycle

### Out of scope for v1

- CSV / bank statement import
- SMS reminders
- Shared / family plans
- Browser extension
- Native mobile app (web only, mobile-responsive)
- Bank account integration (Plaid)
- Auto-detection of subscriptions from email/receipts

## Conventions

- Server actions live in `app/actions/<domain>.ts`, Zod-validated input
- DB access lives in `lib/db/<domain>.ts` — actions never write SQL
  directly
- External service clients in `lib/external/<service>.ts` (resend,
  currency)
- Cron handlers under `app/api/cron/<name>/route.ts`, gated by a
  `CRON_SECRET` header check
- Currency conversion stores both original and converted amount;
  rounds to 2 decimals for display, keeps full precision in DB
- All dates stored as UTC, displayed in the user's local timezone
- Default to RSC + server actions; client components only where
  interactivity actually demands it
- All money values use `decimal(12, 2)` in DB — never floats

## External services

- **Resend** — free tier 3000/month, 100/day. Plenty for v1.
- **exchangerate-api.com** — free tier 1500/month. Cache rates 24h so
  live calls are rare.
- **Neon Postgres** — free tier covers v1 comfortably.
- **Vercel** — hobby tier for hosting + cron.

## Agentic development practices

This project is the practical artifact for an LLM-Augmented Software
Practice course. The product itself does not embed an LLM at runtime;
the "agentic" axis is in *how* it gets built. Use Claude Code throughout
and visibly demonstrate:

- This CLAUDE.md as the spec doc, updated as decisions evolve
- Feature-by-feature prompts with clear acceptance criteria
- Git commits per feature with descriptive messages
- Tests written alongside features for billing-date math and currency
  conversion — the two places where bugs hide

## Key risks

1. **Billing date math.** Monthly cycles starting on the 31st, leap
   years, end-of-month rollover, DST. Mitigation: isolate all date
   arithmetic in `lib/billing/dates.ts` with thorough unit tests. Use
   `date-fns`; never roll custom Date math.
2. **Cron reliability.** Vercel Cron is best-effort on the free tier
   and can skip. Mitigation: make jobs idempotent and catch-up
   oriented — process all overdue items each run, not just today's.
   A missed day self-heals on the next run.
3. **Currency rate freshness.** If exchangerate-api degrades,
   conversions show stale rates. Mitigation: cache with `fetched_at`,
   show "rates updated X hours ago" in the UI.
4. **Email deliverability.** Resend's default sender domain dodges
   spam issues for v1. With a custom domain later, configure SPF/DKIM.

## Definition of done — beta (May 19)

A deployed URL where:

- User can sign in with Google
- Add 5 subscriptions across different categories and cycles
- See accurate monthly and yearly totals
- See a working breakdown chart by category
- Receive an email reminder when a subscription is
  `reminder_lead_days` away from billing
- Cancel a subscription and see it move to history
- Use the app on a phone without UI breaking
