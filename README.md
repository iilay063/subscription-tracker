# Subscription Tracker

Track recurring subscriptions: monthly/yearly totals, category breakdown,
upcoming renewals, and email reminders before each billing.

See [CLAUDE.md](./CLAUDE.md) for the spec.

## Quickstart

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env.local
#   Fill in: DATABASE_URL, AUTH_SECRET, AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET,
#            RESEND_API_KEY, EXCHANGE_RATE_API_KEY, CRON_SECRET

# 3. Database
npm run db:push        # push schema to Neon (no migration files needed for dev)

# 4. Run
npm run dev            # http://localhost:3000

# 5. Tests
npm test
```

### Generating AUTH_SECRET

```bash
openssl rand -base64 32
```

### Google OAuth

Create OAuth credentials in Google Cloud Console. Authorized redirect URI:

- Dev:  `http://localhost:3000/api/auth/callback/google`
- Prod: `https://<your-domain>/api/auth/callback/google`

### Cron endpoints

`vercel.json` schedules two daily jobs:

- `/api/cron/billing-tick` at 00:15 UTC — advances `next_billing_date` and writes
  billing history rows for anything due. Idempotent and catch-up oriented.
- `/api/cron/reminders` at 09:00 UTC — sends email reminders for subscriptions
  within each user's `reminder_lead_days` window. Deduped via `reminder_log`.

Both are gated by `Authorization: Bearer $CRON_SECRET`. For local testing:

```bash
curl "http://localhost:3000/api/cron/reminders?secret=$CRON_SECRET"
curl "http://localhost:3000/api/cron/billing-tick?secret=$CRON_SECRET"
```

## Project layout

```
app/
  (app)/                      # authenticated route group, shares <Nav>
    dashboard/                # totals, chart, upcoming, table
    subscriptions/
      new/                    # add form
      [id]/                   # detail / edit / cancel / history
      cancelled/              # cancelled list with lifetime spend
    settings/                 # preferred currency, reminder lead time
  actions/                    # server actions (Zod-validated)
  api/
    auth/[...nextauth]/       # Auth.js handlers
    cron/billing-tick/        # daily: advance dates + log billings
    cron/reminders/           # daily: send reminder emails
  sign-in/                    # OAuth entry
  page.tsx                    # landing
  layout.tsx, globals.css

components/                   # UI primitives + dashboard/form bits
lib/
  billing/dates.ts            # billing-date math, isolated for tests
  db/                         # schema + per-domain query modules
  external/                   # resend, currency
  emails/                     # email content
  dashboard.ts                # dashboard aggregation
  auth-helpers.ts             # requireUser()
auth.ts                       # Auth.js v5 config
middleware.ts                 # redirects unauthenticated users to /sign-in
tests/                        # vitest unit tests
drizzle.config.ts, vitest.config.ts, vercel.json, components.json
```

## Conventions

- Server actions in `app/actions/<domain>.ts`, validated with Zod.
- DB writes/reads only via `lib/db/<domain>.ts` — actions never write SQL directly.
- External service clients (`lib/external/*`) wrap APIs with caching where applicable.
- All money values: `decimal(12, 2)` in DB. Floats only in transient calculations.
- Dates stored UTC, displayed in user's locale.
- RSC + server actions by default; client components only where interactivity needs them.

## Risks (and how the code addresses them)

1. **Billing-date math** — Isolated in [`lib/billing/dates.ts`](lib/billing/dates.ts).
   Uses `date-fns`, never hand-rolled Date arithmetic. Handles end-of-month clamp
   with anchor-day preservation; covered by [`tests/billing-dates.test.ts`](tests/billing-dates.test.ts).
2. **Cron reliability** — `billing-tick` is idempotent and catch-up oriented:
   processes all overdue items, not just today. Missed days self-heal.
3. **Currency rate freshness** — Cached 24h in `exchange_rates_cache` with
   `fetched_at`. Stale-cache fallback if the API errors. Dashboard surfaces age.
4. **Email deliverability** — Uses Resend's default sender for v1; switch to
   a custom domain with SPF/DKIM later.

## Deploy to Vercel

1. Push to GitHub.
2. Import to Vercel, link your Neon Postgres, set env vars from `.env.example`.
3. The crons in `vercel.json` are picked up automatically; Vercel sends
   `Authorization: Bearer $CRON_SECRET` if you configure the secret in the
   Vercel cron settings.
