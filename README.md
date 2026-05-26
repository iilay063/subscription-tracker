# Subscription Tracker

A web app for tracking recurring subscriptions: what you pay, when
you'll be charged next, and how much you spend per month and per
year. Email reminders fire a configurable number of days before each
renewal so you can cancel things you no longer use.

Built for the **LLM-Augmented Software Practice** course. The product
itself does not embed an LLM at runtime — the "agentic" axis of the
project is in *how* it was built, using Claude Code throughout the
development lifecycle. See the [Agentic development](#agentic-development)
section below.

The full design spec lives in [CLAUDE.md](./CLAUDE.md), which doubles
as the prompt context the AI agent reads on every session.

🔗 **Live demo:** https://subscription-tracker-nine-sable.vercel.app/

---

## What the app does

1. **Sign in with Google** — Auth.js v5 (NextAuth) handles the OAuth
   flow; user records are persisted in Postgres via the Drizzle
   adapter.
2. **Add a subscription** — name, cost, currency (incl. ILS / ₪),
   billing cycle (weekly / monthly / yearly / custom N-days), next
   billing date, category (chosen from a preset list with distinct
   colors), optional URL, optional notes. Two extra knobs:
   - Mark it as a **free trial** with an end date for a stronger
     reminder before the trial converts.
   - Override the global reminder lead time **per subscription**.
3. **Dashboard** — monthly total, yearly total, category breakdown
   chart (Recharts), upcoming billings in the next 30 days, and the
   full list of active subscriptions with **client-side search,
   category filter, and sort** (next billing / name / cost). All
   amounts are converted to the user's preferred currency. Each row
   shows the service's **favicon** (derived from its URL) and a
   **price-change indicator** when the latest billing differs from
   the previous one. Trials are tagged with a purple "Trial" badge.
4. **Monthly budget** — set a cap in Settings; the dashboard surfaces
   a banner when you cross 80% and a stronger warning past 100%. A
   matching email fires at most once per month.
5. **Cancel** — subscriptions are never deleted, only marked
   cancelled. A separate "cancelled" view shows lifetime spend per
   subscription.
6. **Email reminders** — a daily cron job sends three distinct kinds
   of mail:
   - **Renewal reminder** N days before each billing (configurable
     globally or per-subscription).
   - **Trial-ending reminder** N days before a trial ends.
   - **Budget alert** once per month when projected spend exceeds the
     user's monthly budget.
7. **Auto billing tick** — a second daily cron advances
   `next_billing_date` by one cycle when a subscription is due, and
   writes a row to `billing_history` so lifetime totals stay accurate.
8. **CSV export** — one-click download of the full subscription list
   (active + cancelled) including all metadata.
9. **Dark mode** — toggle in the nav, persisted to `localStorage`,
   no flash on first load.

---

## APIs and external services — what's used and how

Every external service was chosen on its free tier and is wrapped in
its own module under `lib/external/*` or `lib/db/*` so the surface
area is auditable and swappable.

### 1. Google OAuth — via Auth.js v5

- **Where:** [`auth.ts`](auth.ts), [`app/api/auth/[...nextauth]/route.ts`](app/api/auth/[...nextauth]/route.ts),
  [`middleware.ts`](middleware.ts)
- **How it's wired:** Auth.js v5 (`next-auth@5.0.0-beta`) is configured
  with the Google provider and `@auth/drizzle-adapter`, so user /
  account / session rows live in our Postgres schema (no separate
  user store). Middleware redirects unauthenticated requests on
  protected routes to `/sign-in`.
- **Why:** Google OAuth was the lightest viable auth — no password
  storage, no email-verification flow to maintain.

### 2. Neon Postgres — via Drizzle ORM

- **Where:** [`drizzle.config.ts`](drizzle.config.ts),
  [`lib/db/schema.ts`](lib/db/schema.ts), and per-domain query modules
  in [`lib/db/`](lib/db/)
- **How it's wired:** `@neondatabase/serverless` driver talks to Neon
  over HTTP (works on Vercel's serverless / edge runtime). All schema
  is defined in Drizzle TypeScript, pushed with `drizzle-kit push`,
  and queried through small per-domain modules (`subscriptions.ts`,
  `categories.ts`, `billing-history.ts`, `reminder-log.ts`,
  `exchange-rates.ts`, `users.ts`). **Server actions never write SQL
  directly** — the DB layer is the only place that touches the ORM.
  This keeps validation, transaction boundaries, and the schema /
  query mapping in one place.
- **Domain tables:** `users`, `accounts`, `sessions` (Auth.js),
  `categories`, `subscriptions`, `billing_history`, `reminder_log`,
  `exchange_rates_cache`.
- **Schema notes:** `subscription` carries optional trial fields
  (`is_trial`, `trial_ends_at`) and a `reminder_lead_days_override`.
  `user` carries `monthly_budget` and `budget_alert_sent_for_month`
  (YYYY-MM dedupe key). `reminder_log.kind` is an enum of
  `renewal | trial_ending | budget_alert` so the dedupe check can be
  scoped per kind.

### 3. Resend — transactional email API

- **Where:** [`lib/external/resend.ts`](lib/external/resend.ts),
  [`lib/emails/`](lib/emails/) (three templates: `reminder.ts`,
  `trial-ending.ts`, `budget-alert.ts`),
  [`app/api/cron/reminders/route.ts`](app/api/cron/reminders/route.ts)
- **How it's wired:** A lazy singleton Resend client. Email content
  is rendered server-side and sent via `resend.emails.send`. Every
  send (success or failure) is logged to `reminder_log`, which is also
  used to **dedupe per kind** — a user can only receive one of each
  email kind per dedupe key (renewal: per `next_billing_date`,
  trial: per `trial_ends_at`, budget: per calendar month).
- **Free-tier headroom:** Resend's free tier allows 3000 emails/month
  and 100/day, which comfortably covers the v1 beta cohort.

### 4. exchangerate-api.com — multi-currency support

- **Where:** [`lib/external/currency.ts`](lib/external/currency.ts),
  [`lib/db/exchange-rates.ts`](lib/db/exchange-rates.ts)
- **How it's wired:** Subscriptions can be stored in any currency,
  but the dashboard displays everything in the user's
  `preferred_currency`. The `getRate(base, quote)` helper:
  1. Returns `1` immediately for same-currency pairs.
  2. Looks up `exchange_rates_cache` and returns the cached rate if
     it's less than 24 hours old.
  3. Otherwise calls `https://v6.exchangerate-api.com/v6/{key}/pair/{base}/{quote}`,
     persists the result, and returns it.
  4. If the live API fails, **falls back to the stale cache** rather
     than erroring out — staleness is preferred over downtime.
- **Why a cache:** the free tier is 1500 requests/month. With a 24h
  cache, real call volume stays well inside the limit even with many
  users and many currencies.

### 5. Google's favicon service — subscription logos

- **Where:** `faviconFor()` in [`lib/dashboard.ts`](lib/dashboard.ts)
- **How it's wired:** When a subscription has a `url`, the dashboard
  derives `https://www.google.com/s2/favicons?domain={host}&sz=64`
  and renders it as a 4×4 px logo. Falls back to a colored dot if no
  URL is set. No API key, no storage, no cache to manage — the
  browser caches the image via Google's CDN.

### 6. Vercel Cron — scheduled jobs

- **Where:** [`vercel.json`](vercel.json),
  [`app/api/cron/billing-tick/route.ts`](app/api/cron/billing-tick/route.ts),
  [`app/api/cron/reminders/route.ts`](app/api/cron/reminders/route.ts)
- **How it's wired:** `vercel.json` declares two cron entries (the
  hobby-tier limit). Vercel hits each route on schedule with
  `Authorization: Bearer $CRON_SECRET`; both handlers verify the
  secret before doing any work.
  - `/api/cron/billing-tick` — daily at 00:15 UTC. For every active
    subscription whose `next_billing_date <= today`, writes a
    `billing_history` row (with the converted-to-user-currency
    amount snapshotted at billing time) and advances
    `next_billing_date` by one cycle.
  - `/api/cron/reminders` — daily at 09:00 UTC. Three jobs in one
    handler to stay under the cron limit:
    1. **Renewal reminders** — find subs within `leadDays` of their
       next billing (using per-sub override if set, else the user
       default), send, log.
    2. **Trial-ending reminders** — same logic against `trial_ends_at`
       for trial subs.
    3. **Budget alerts** — tally each user's projected monthly total
       in their preferred currency; if it exceeds the budget and no
       alert has been sent for the current month, send and stamp
       `budget_alert_sent_for_month`.
- **Idempotency:** both jobs are catch-up oriented and process *all*
  qualifying rows, not just "today's", so a skipped run self-heals
  on the next tick. Dedupe is keyed in `reminder_log` (per kind +
  per dedupe date) and in `user.budget_alert_sent_for_month`.

### 7. Vercel — hosting

- The whole app is a single Next.js 15 (App Router) deployment.
  Server-side rendering is React Server Components by default; client
  components are used only where interactivity demands it (forms,
  chart tooltips, dropdown menus, the search/filter/sort UI, the
  theme toggle).

---

## Architectural choices (and why)

- **Next.js App Router + RSC + server actions.** Reads are RSC
  (zero JS shipped for data-fetching code); writes are server actions
  with Zod-validated input. The only hand-rolled `/api/*` routes are
  the cron handlers, the Auth.js handler, and the CSV export.
- **Strict layering.** `app/actions/<domain>.ts` ↔ `lib/db/<domain>.ts`
  ↔ Drizzle schema. Actions never touch SQL; UI never touches the DB.
  External services (Resend, exchangerate-api) sit behind
  `lib/external/*` so they can be mocked or swapped.
- **`lib/money.ts` is pure and isolated from the DB module.** Client
  components import formatters from there directly; only server code
  imports `lib/external/currency.ts`, which is marked `server-only`
  so a stray client import fails the build instead of leaking the
  Postgres driver into the browser bundle.
- **Money is `decimal(12, 2)` everywhere.** Never floats in storage —
  floats only appear in transient currency-conversion calculations,
  then get rounded for display.
- **Dates are UTC in the DB, local in the UI.** All billing-date math
  is isolated in [`lib/billing/dates.ts`](lib/billing/dates.ts), uses
  `date-fns`, and has a dedicated test file. No hand-rolled `Date`
  arithmetic anywhere else in the codebase.
- **Category colors are resolved at read time** from a preset list
  (`lib/categories-presets.ts`), with a hash-based fallback palette
  for any legacy custom names. The DB still stores per-row color, so
  the read-time resolution is layered on top without a migration.

---

## Tests

`vitest` unit tests live in [`tests/`](tests/). They focus on the two
places where bugs are most likely to hide and most expensive to ship:

- **Billing-date math** — end-of-month rollover (a monthly cycle
  anchored to the 31st), leap years, weekly / yearly / custom N-day
  cycles, anchor-day preservation when stepping forward, catch-up
  across multiple missed cycles.
- **Currency conversion** — `round2` semantics and `formatMoney`
  output for common and unknown currency codes.

Run with `npm test`. Current status: **24 / 24 passing**.

---

## Risks and mitigations

These are the four pre-identified risks called out in the spec, and
how the code addresses each one:

| Risk | Mitigation in code |
| ---- | ------------------ |
| **Billing-date math edge cases** (end-of-month, leap year, DST) | Isolated in [`lib/billing/dates.ts`](lib/billing/dates.ts), uses `date-fns`, covered by [`tests/billing-dates.test.ts`](tests/billing-dates.test.ts). |
| **Cron reliability** — Vercel Cron is best-effort on the free tier | Both jobs are idempotent + catch-up oriented; a missed day self-heals on the next run. Reminder dedupe via `reminder_log` keyed by `(subscription_id, dedupe_date, kind)`; budget dedupe via `user.budget_alert_sent_for_month`. |
| **Currency rate freshness** | 24h DB cache (`exchange_rates_cache`); stale-cache fallback when the live API errors; UI surfaces rate age. |
| **Email deliverability** | Resend's default sender domain for v1; ready to switch to a custom domain with SPF/DKIM later. |

---

## Agentic development

This project is the practical artifact for an LLM-Augmented Software
Practice course. The agentic axis is **how** the codebase was built,
not what it does at runtime. Concretely:

- **[CLAUDE.md](./CLAUDE.md) is the living spec.** It documents the
  stack, the domain model, the core flows, the out-of-scope list, the
  conventions, and the known risks. Every Claude Code session reads
  it as system context, so prompts can stay short and stay aligned
  with the project's decisions. It is updated as decisions evolve.
- **Feature-by-feature prompts** with clear acceptance criteria, one
  prompt → one feature → one commit. Commit messages describe the
  intent so the git history doubles as a development log. Bigger
  features that touch multiple files were sequenced into
  schema-first / UI / cron commits so each ships independently.
- **Tests written alongside features** for the two highest-risk areas
  (billing-date math and currency conversion).
- **Strict layering enforced by convention** so the AI agent has a
  small, predictable surface to edit on each task and cannot
  accidentally smear DB access across the codebase.
- **Manual migration files in `drizzle/manual/`** alongside the
  Drizzle schema, used when `drizzle-kit push` misreads existing
  Postgres state (e.g. emits spurious `DROP CONSTRAINT *_not_null`
  statements). Pasting the captured SQL into Neon's editor is the
  documented escape hatch.

---

## Definition of done — beta

A deployed URL where the user can:

- ✅ Sign in with Google
- ✅ Add subscriptions across different categories, cycles, and
  currencies (USD / EUR / GBP / ILS / and 7 others by default)
- ✅ See accurate monthly and yearly totals in their preferred
  currency
- ✅ See a working category-breakdown chart with distinct colors per
  category
- ✅ Search, filter, and sort their subscription list
- ✅ Receive an email reminder a configurable number of days before
  a subscription bills, with per-subscription overrides
- ✅ Mark a subscription as a free trial and receive a distinct
  trial-ending reminder
- ✅ Set a monthly budget and receive a once-per-month alert when
  spend exceeds it
- ✅ Cancel a subscription and see it in the cancelled view with
  lifetime spend
- ✅ Export the full list to CSV
- ✅ Toggle dark mode (persisted)
- ✅ Use the app on a phone without UI breaking

---

## Project layout (for reference)

```
app/
  (app)/                            authenticated route group, shares <Nav>
    dashboard/                      totals, chart, upcoming, search/filter table
    subscriptions/new               add form (trial + reminder override)
    subscriptions/[id]              detail / edit / cancel / history
    subscriptions/cancelled         cancelled list with lifetime spend
    settings/                       preferred currency, reminder lead, budget
  actions/                          server actions (Zod-validated)
  api/auth/[...nextauth]/           Auth.js handlers
  api/cron/billing-tick/            daily: advance dates + log billings
  api/cron/reminders/               daily: renewals + trials + budget alerts
  api/export/subscriptions.csv/     authenticated CSV download
  sign-in/                          OAuth entry
  page.tsx                          landing
  layout.tsx                        theme-flash-prevention script + footer

components/
  ui/                               shadcn-style primitives
  dashboard/                        summary cards, chart, upcoming,
                                    subscriptions table, search/filter/sort,
                                    budget banner
  subscription-form.tsx             add / edit form
  settings-form.tsx                 settings form
  theme-toggle.tsx                  dark-mode toggle
  nav.tsx                           top-of-page nav
  footer.tsx                        site footer with credit

lib/
  billing/dates.ts                  billing-date math, isolated for tests
  db/                               schema + per-domain query modules
  external/                         resend, exchangerate-api clients
  emails/                           reminder, trial-ending, budget-alert
  dashboard.ts                      dashboard aggregation
  money.ts                          pure formatters (client-safe)
  currencies.ts                     supported currency codes
  categories-presets.ts             preset category list + color resolver
  auth-helpers.ts                   requireUser()
auth.ts                             Auth.js v5 config
middleware.ts                       redirects unauthenticated users to /sign-in
drizzle/manual/                     hand-written SQL escape hatches
tests/                              vitest unit tests
```

---

## Author

**Ilay Weizman** ([@iilay063](https://github.com/iilay063))

Source on GitHub: [iilay063/subscription-tracker](https://github.com/iilay063/subscription-tracker)
