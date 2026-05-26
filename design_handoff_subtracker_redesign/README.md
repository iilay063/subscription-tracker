# Handoff: Subscription Tracker — "Halo" redesign

> A visual redesign of the Subscription Tracker dashboard, detail, settings, and cancelled views. This package gives you the design intent (colors, type, layout, component-by-component spec) plus a working HTML reference. Your job is to recreate the look in the existing Next.js 15 / Tailwind / shadcn codebase — not to copy the HTML wholesale.

---

## 1 — About these design files

The `source/` folder contains a working HTML prototype built with **React + Tailwind via CDN**. It is **a design reference, not production code**. Don't import these files into the Next.js app — the existing app already has Next.js App Router, Drizzle, Auth.js, server actions, all the plumbing. The redesign is purely the visual + interaction layer.

The prototype includes **four directions** (Halo, Aurora, Eclipse, Folio). **Halo is the one to ship** — Aurora and Eclipse are kept in `source/` only as reference for the components Halo borrows from. Folio was an editorial alternative that we're not shipping.

To run the prototype locally and click through it:

```bash
cd source/
python3 -m http.server 8000
# open http://localhost:8000
```

The floating pill at the top of the prototype switches between directions; the Tweaks panel (bottom-right toggle in the toolbar of the host environment) flips dark/light and toggles the calendar view.

## 2 — Fidelity

**High-fidelity.** Use the exact hex values, font sizes, paddings, and radii listed in the design tokens below. The prototype was built at the same density as the target app, so 1px in the prototype is 1px in production.

## 3 — Codebase the design targets

Repo: [`iilay063/subscription-tracker`](https://github.com/iilay063/subscription-tracker)

- **Framework:** Next.js 15 (App Router) + RSC + server actions
- **Styling:** Tailwind CSS (config at `tailwind.config.ts`) + shadcn-style UI primitives in `components/ui/`
- **DB:** Neon Postgres via Drizzle
- **Auth:** Auth.js v5 (Google OAuth)
- **Charts:** Recharts (currently used for the category pie)

The design swaps shadcn's default zinc palette for the warm dark Halo palette, replaces the Recharts pie with a hand-rolled SVG donut, swaps the table-only listing for a table + calendar/timeline hero, and introduces a left sidebar nav.

## 4 — The Halo direction at a glance

- **Canvas:** warm near-black `#0E0D0B` (dark default) or warm off-white `#FAFAF7` (light)
- **Sidebar nav:** 228px, persistent, with active-item raised card treatment
- **Hero:** big tabular monthly number on the left, donut spending mix on the right
- **Upcoming:** toggleable between a 30-day **timeline rail** (bars by day) and a **month calendar grid** (billings on each day)
- **Accents:** emerald `#2B8F66` primary, violet `#8C6FFF` for trials, coral `#E18B6B` for warnings / price increases
- **Type:** Inter for everything; tabular numerals (`tnum`) on all money/date numbers

---

## 5 — Design tokens

### Color tokens

Add a new theme to `app/globals.css`. Keep both modes available via the existing `class` strategy in `tailwind.config.ts` (`darkMode: ["class"]`).

```css
/* app/globals.css */

@layer base {
  /* Halo light */
  :root {
    --bg:            #FAFAF7;
    --surface:       #FFFFFF;
    --surface-muted: #F5F3EE;
    --border:        #ECEAE3;
    --border-strong: #DFDBD2;
    --ink:           #0E0E0C;
    --ink-2:         #3B3935;
    --muted:         #84807A;
    --faint:         #B0ACA4;

    --accent:        #2B8F66;  /* emerald */
    --accent-fg:     #FFFFFF;
    --violet:        #8C6FFF;  /* trials, secondary */
    --violet-tint:   rgba(140, 108, 255, 0.16);
    --coral:         #E18B6B;  /* warnings, price increases */
    --coral-tint:    rgba(225, 139, 107, 0.16);

    --donut-track:   #ECEAE3;
    --shadow:        0 1px 0 rgba(20,20,20,0.02), 0 8px 24px -16px rgba(20,20,20,0.08);
  }

  /* Halo dark */
  .dark {
    --bg:            #0E0D0B;
    --surface:       #16140F;
    --surface-muted: #1C1A14;
    --border:        #26241C;
    --border-strong: #34322A;
    --ink:           #F5F1E8;
    --ink-2:         #C9C2B3;
    --muted:         #8A8475;
    --faint:         #5C574B;

    --accent:        #2B8F66;
    --accent-fg:     #FFFFFF;
    --violet:        #8C6FFF;
    --violet-tint:   rgba(140, 108, 255, 0.16);
    --coral:         #E18B6B;
    --coral-tint:    rgba(225, 139, 107, 0.16);

    --donut-track:   #26241C;
    --shadow:        0 1px 0 rgba(255,255,255,0.02) inset, 0 8px 24px -16px rgba(0,0,0,0.6);
  }
}
```

Replace the existing HSL CSS variables in `app/globals.css` (`--background`, `--foreground`, etc.) with these. Update `tailwind.config.ts` to surface them as utilities:

```ts
// tailwind.config.ts
extend: {
  colors: {
    bg:           'var(--bg)',
    surface:      'var(--surface)',
    'surface-muted': 'var(--surface-muted)',
    border:       'var(--border)',
    'border-strong': 'var(--border-strong)',
    ink:          'var(--ink)',
    'ink-2':      'var(--ink-2)',
    muted:        'var(--muted)',
    faint:        'var(--faint)',
    accent:       'var(--accent)',
    violet:       'var(--violet)',
    coral:        'var(--coral)',
  },
  boxShadow: {
    halo: 'var(--shadow)',
  },
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
  },
}
```

### Category colors

Existing app stores `color` per category in Postgres but the design overrides with a curated palette that reads well on both modes. Update `lib/categories-presets.ts` so the resolver returns these in place of any per-row color when rendering Halo:

| Category       | Hex      |
|----------------|----------|
| Entertainment  | `#E18B6B` |
| Productivity   | `#2B8F66` |
| Software       | `#7C9CFF` |
| Cloud Storage  | `#5DC2D0` |
| News           | `#C9A87C` |
| Health         | `#E879B7` |
| (fallback)     | `#84807A` |

### Typography scale

Single family: **Inter** (already a safe default). Use `font-feature-settings: "tnum"` (Tailwind: `tabular-nums` or custom utility `tnum`) on every number — money, dates, counts, percentages.

| Token         | Size  | Weight | Tracking   | Use                                      |
|---------------|-------|--------|------------|------------------------------------------|
| display       | 56px  | 600    | -0.03em    | Monthly total (hero)                     |
| h1            | 28px  | 600    | -0.02em    | Screen titles (Good evening / Settings)  |
| h2            | 22px  | 500    | -0.02em    | Detail stat values                       |
| body          | 13.5px| 400    | normal     | Default body                             |
| body-medium   | 13.5px| 500    | normal     | Row primary text                         |
| meta          | 12px  | 400    | normal     | Secondary text / "as of"                 |
| label         | 11px  | 400    | 0.14em up  | UPPERCASE labels above cards/headers     |
| micro         | 10px  | 400    | 0.1em up   | Table headers, badges                    |

### Spacing & radii

- Card padding: 28px (large), 24px (medium), 20px (small)
- Card radius: 12px (`rounded-xl`)
- Inner element radius: 8px (`rounded-lg`), 6px (`rounded-md`)
- Logo radius: 8px (`rounded-md`) at 28–48px; 16px (`rounded-2xl`) at 64px+
- Pill radius: full (`rounded-full`) for badges and toggles
- Gap between cards in dashboard grid: 20px (`gap-5`)

### Shadows

Only on raised cards (hero, calendar, lists). Use `box-shadow: var(--shadow)`. Buttons and rows are flat — no shadows.

---

## 6 — Screen-by-screen spec

### 6.1 — Layout shell (applies to every authenticated screen)

**File to update:** `app/(app)/layout.tsx`, `components/nav.tsx` (rename to `sidebar.tsx` and rebuild)

- Two-column flex: 228px sidebar (left, persistent on `md+`) + flexible main area
- Sidebar pieces, top to bottom:
  1. Logo: 28×28 emerald square with white `S`, then **Sub·tracker** in 14px/600. 20px horizontal pad, 20px top/bottom.
  2. Nav links: Dashboard, Subscriptions, Cancelled, Settings. Each link is a button with `flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13.5px]`. **Active state:** background `var(--surface)`, box-shadow `var(--shadow)`, font-weight 500, plus a 6px emerald dot on the right edge (Dashboard only).
  3. "VIEWS" section header — 10.5px uppercase, `tracking-[0.12em]`, `var(--muted)`. Below it, top 4 categories as inline items (color dot · name · count on the right).
  4. User footer: avatar (32px, warm taupe `#7A6F5E`) + name (13px/500) + email (11.5px muted), 16px padding, border-top.
- Main area: `flex-1 min-w-0`, content gets `px-10 py-8`, capped at `max-w-[1200px]`.
- Mobile (`< md`): sidebar hides. Add a hamburger to a top bar (not implemented in the prototype — design at your discretion using the same tokens).

### 6.2 — Dashboard

**File:** `app/(app)/dashboard/page.tsx`

#### Top greeting bar
- Date label (12px uppercase, `tracking-[0.14em]`, muted): `Tuesday, May 26` — render the actual current date.
- Title (28px/600, `-0.02em`): `Good evening, Ilay.` — use the user's first name from `auth()`; switch greeting on hour (morning/afternoon/evening).
- Right side: two buttons — **Export** (outline, 36px tall, `border` color, `var(--ink-2)` text) and **Add subscription** (filled, accent bg, white text), both with `Icon` + label inline.

#### Hero row (12-col grid, `gap-5`)
- **Monthly card** (`col-span-7`):
  - Rounded-xl, surface bg, hairline border, `var(--shadow)`. Padding 28px.
  - Top-left: "THIS MONTH" label.
  - Below it: monthly total in 56px/600, `-0.03em`, tabular-nums. Whole-dollar portion in ink; the `.XX` cents at 28px aligned to top of the digits, color `var(--faint)`.
  - Below the number: `+$9.00 vs last month`. The +$ in coral if over budget else accent. Then `· $2,270 / yr projected` in muted.
  - Top-right of the card: "ACTIVE" label + count (28px/500) + "subscriptions" caption.
  - Footer of card (separated by hairline `border-t var(--border)`): "Monthly budget" label + `$189.19 of $220` tabular. Below it a 6px-tall progress bar (`rounded-full`, `background: var(--surface-muted)`) with an inner fill colored accent (or coral if over). Below the bar: "14% headroom this month" (or "Over budget by $X").
- **Spending mix donut** (`col-span-5`):
  - Same card chrome.
  - Card header: "SPENDING MIX" label + "By category" subtitle.
  - Inside, two columns flex with `gap-6`:
    - **Donut:** 150×150 SVG. Stroke width 16, radius 58. Track in `var(--donut-track)`. Each slice gets its category color. 2px gap between slices via `strokeDasharray`. Whole donut is `-rotate-90` so first slice starts at 12 o'clock. Center label: "MONTHLY" (10px uppercase) + total in 18px/600 tabular.
    - **Legend:** vertical list, one row per category. Row: 8px color dot · category name · percent (`var(--muted)`, tabular). Both columns truncate.

#### Upcoming card (full width)
- Card header on left: "UPCOMING" label + "11 charges in next 30 days" (15px/500).
- Right side of header: `Total due: $X` in tabular + a **view toggle**: a 2-segment pill (`rounded-md`, `border var(--border-strong)`, `bg var(--surface-muted)`, 2px inner padding). Active segment gets `var(--surface)` background and a subtle shadow. Segments: **Timeline** (chart icon) and **Calendar** (grid icon).

##### Timeline view
- A horizontal strip of 30 columns, each 34px wide. Each column has:
  - An 80px-tall area, billings rendered as a bar growing from the bottom. Bar width 28px, color: today = accent, other days = `var(--surface-muted)`. Bar height: `22 + (dayTotal / maxDayTotal) * 56`px.
  - Inside the bar, up to 3 small (6px) circles colored by category — visual key to what's billing that day.
  - Day number below (10px tabular). Today is bold + ink color, others muted.
  - When a column hits day 1 of a month, show the month abbreviation under the day in 9px uppercase faint.
- Below the strip (mt-6): three "featured upcoming" cards horizontally — each is a small flex row inside a `surface-muted` rounded-lg card with logo, name, "May 28 · in 2d", and the cost.

##### Calendar view
- Standard month grid, 6 weeks × 7 cols, `gap-px` so a 1px border shows between cells. Outer wrapper has the same gap and bg = `var(--border)`.
- Day-of-week header row above: 7 cells, "Sun Mon Tue …" in 10.5px uppercase muted, `tracking-[0.1em]`.
- Each cell: `min-h-[78px]`, `padding 8px`. In-month cells: `bg var(--surface)`; out-of-month: `bg var(--surface-muted)`.
- Cell content:
  - Top row: day number (11px tabular) on the left; today gets bold + ink + a 6px accent dot on the right.
  - Bottom: up to 2 "billing chips" — `text-[10px]`, truncate, `rounded`, `bg var(--surface-muted)`, with a 2px **left border** in the billing's category color. If more than 2, add a small `+N more` line. Then the day total in 10px tabular muted.

#### Trials & price changes row
- Only render if at least one trial or one recent price change exists.
- Two cards side-by-side (`md:col-span-6`), card chrome same as before but no shadow (these are secondary).
- **Trials ending soon:**
  - Header: sparkles icon in violet + "Trials ending soon" (14px/500).
  - Each row: 32px logo · name + "Converts to $X / mo on Jun 1" · pill on the right showing "6d left". Pill bg = `var(--violet-tint)`, text = violet for normal trials; if ≤3 days, switch to coral-tint bg + coral text.
- **Recent price changes:**
  - Header: trend-up icon in coral + "Recent price changes".
  - Each row: 32px logo · name + "$19.99 → $22.99" (tabular muted) · `↑ +$3.00` on the right in coral.

#### Active subscriptions table
- Card chrome with shadow.
- Header: "ACTIVE" label + "12 subscriptions" + a 32px search input (with magnifier icon, 44px-wide expansion possible) and "Filter" button on the right.
- Table: 6 columns — Service, Category, Cycle, Next charge, Cost (right), Monthly (right). Header row in 11px uppercase `tracking-[0.1em]` muted. Rows separated by hairline `border-t var(--border)`. No row backgrounds; hover state can be `bg-white/[0.02]` in dark / `bg-black/[0.02]` in light.
- **Service cell:** 28px logo + name + small badges (Trial = violet pill, price change = `↑ +$3` in coral) above the domain (11px muted).
- **Category cell:** dot + label.
- **Cycle cell:** capitalized cycle word.
- **Next charge cell:** Date in tabular + "in 4 days" in 11px muted below.
- **Cost / Monthly cells:** tabular, right-aligned. Cost is medium-weight, Monthly is muted.

### 6.3 — Subscription detail

**File:** `app/(app)/subscriptions/[id]/page.tsx`

- Container `max-w-[1080px]`, `px-10 py-8`.
- Back link (12.5px muted with `chevronLeft` icon).
- **Hero row** (no card chrome):
  - 64px rounded-2xl logo with `ring-1 ring-black/5`.
  - Name (26px/600 `-0.02em`) + domain link (12px muted).
  - Below name, a meta strip: `<category dot> Category · Active since Aug 3, 2019 · Raised $1.00 on May 8` (the price-raise note in coral, with an up-arrow icon).
  - Right side: outline **Edit** button (pencil icon) and outline **Cancel subscription** button (text in coral).
- **Stat grid:** 4 cards (`col-span-3` each) — Cost / Next charge / Lifetime spend / Reminder. Card padding 20px. Each: 11px label, 22px/500 tabular value, 11.5px muted sub.
- **Main two-column row:**
  - Left (`col-span-8`): "Billing history" card. Title 15px/500, description 12px muted. Then a list of 6 rows, each: date (tabular ink-2) · "Charged · Card ending 4242" (muted) · amount (tabular medium right-aligned). If amount differs from the next row, add `+$1.00` in coral after the amount.
  - Right (`col-span-4`): two stacked cards. "Notes" (free-form prose) and "Quick actions" (full-width left-aligned buttons: Open service / Pause for 1 month / Change billing date / Move to another category, each with a chevron on the right).

### 6.4 — Settings

**File:** `app/(app)/settings/page.tsx` (currently a thin shell; build the form out)

- Page title block: "ACCOUNT" label, then "Settings" 28px/600.
- Three section cards (`max-w-[820px]`):
  - **Preferences:** Preferred currency (select), Reminder lead time (segmented control with 4 options: 1d/3d/7d/14d — selected gets accent bg, white text), Monthly budget (inline `$` + numeric input).
  - **Notifications:** four toggle rows — Renewal reminders / Trial-ending reminders / Budget alerts / Weekly digest. Toggle is 36×20 pill; ON bg = accent, OFF bg = `var(--border-strong)`; inner thumb is 16px white with `0 1px 2px rgba(0,0,0,0.15)` shadow. Label 13.5px/500 + 12px muted description on the left.
  - **Data:** "Export CSV" outline button + destructive-styled "Delete account" outline button (text in coral).
- Each section card: padding 28px, header block has 15px/500 title + 12.5px muted desc, then a 20px space, then rows. Rows have 12px vertical padding, separated by `border-b var(--border)` except the last.

### 6.5 — Cancelled (archive)

**File:** `app/(app)/subscriptions/cancelled/page.tsx`

- Container `max-w-[1080px]`, `px-10 py-8`.
- Header row: title block on the left (label "ARCHIVE" + "Cancelled subscriptions" 28px/600) and a right-aligned stat: "LIFETIME SPEND (CANCELLED)" label + total in 24px/600 tabular.
- One single card containing the cancelled list:
  - Column header strip with: Service (5) / Active period (3) / Last cost (2 right) / Lifetime (2 right) — each header 11px uppercase muted.
  - Each row: 32px logo + name + category caption (5) / date range + month count (3) / cost (2 right) / lifetime (2 right, bold).
- Footnote below the card: "Cancelled subscriptions are kept so totals stay accurate. To restart one, add it again as new." — 12px muted.

---

## 7 — Interactions & behavior

### Calendar view toggle
- Persist the active view per-user. Easiest: localStorage `subtracker.calendarView = "timeline" | "grid"` (no DB churn for a pure preference).
- Switching is instant, no animation needed.

### Dark mode
- Already wired in the codebase (`ThemeToggle` writes `class="dark"` to `<html>`). Move the toggle from the top nav into the sidebar footer next to the user info, or into Settings (small icon button next to "Settings" title).

### Budget banner
- The over-/under-budget treatment is the **footer of the monthly card**, not a separate floating banner. Remove `components/dashboard/budget-banner.tsx` or repurpose it to render *only* if budget is over (a one-line red callout at the very top of the dashboard).

### Hover states
- Sidebar nav inactive items: `hover:bg-white/[0.03]` (dark) / `hover:bg-black/[0.03]` (light).
- Table rows: same.
- Buttons: outline buttons get a 5% darken; filled accent buttons stay flat (no hover change) — accent is already loud.

### Empty states
- Each section ("Trials ending soon", "Recent price changes", calendar with no billings) should render nothing (collapse) rather than empty cards. The Dashboard hero (monthly card + donut + budget) always renders, even with zero subscriptions — show `$0.00` and "Add your first subscription" CTA in the active subscriptions card.

### Animations
- One micro-animation only: the calendar view toggle's selected indicator pill should slide. If easy with `framer-motion` (already feasible in this project): 150ms `cubic-bezier(.3,.7,.4,1)`. If not, ship it static.

---

## 8 — Component map (existing files → what to change)

| Existing file | Change |
|---|---|
| `app/(app)/layout.tsx` | Wrap `<Nav>` (now sidebar) + main with a 2-col flex; pass user info to sidebar. |
| `components/nav.tsx` | Rename to `sidebar.tsx`. Rebuild as the spec'd sidebar — logo, nav links with active state, Views section listing top 4 categories with counts, user footer. |
| `app/(app)/dashboard/page.tsx` | Rebuild from the spec in §6.2. Compose: greeting bar, hero row (`MonthlyHero` + `SpendingMixDonut`), `UpcomingCard`, `TrialsCard` + `PriceChangesCard`, `SubscriptionsTable`. |
| `components/dashboard/summary-cards.tsx` | Delete — folded into `MonthlyHero`. |
| `components/dashboard/category-chart.tsx` | Replace Recharts pie with a pure SVG `Donut` component (port from `source/halo.jsx` lines 350-385). Keep the same `data` shape. |
| `components/dashboard/upcoming-list.tsx` | Replace with `UpcomingCard` that holds both `TimelineRail` and `CalendarGrid` views + the toggle. |
| `components/dashboard/subscriptions-section.tsx` | Slim down — search + filter + sort UI stays, but rendered as the table in §6.2. |
| `components/dashboard/subscriptions-table.tsx` | Rework: new column order (Service / Category / Cycle / Next / Cost / Monthly), category dot inline, badges in service cell, no row borders inside the card (only between rows). |
| `components/dashboard/budget-banner.tsx` | Remove or repurpose to render only when over budget (see §7). |
| `app/(app)/subscriptions/[id]/page.tsx` | Rebuild per §6.3. |
| `app/(app)/settings/page.tsx` + `components/settings-form.tsx` | Rebuild per §6.4. Use shadcn `Select`, `Input`, but the toggle and segmented control need to be hand-rolled (or use shadcn `Switch` + `ToggleGroup`). |
| `app/(app)/subscriptions/cancelled/page.tsx` | Rebuild per §6.5. |
| `app/globals.css` | Replace the existing CSS variables with the Halo light + dark tokens in §5. |
| `tailwind.config.ts` | Update `colors` to surface Halo tokens. |
| `lib/categories-presets.ts` | Update color palette to the curated set in §5. |

### New components to add

Suggested location: `components/halo/` (or just merge into `components/dashboard/`).

- `Sidebar` — full nav including user footer.
- `MonthlyHero` — props: `monthlyTotal`, `yearlyTotal`, `budget`, `activeCount`, `vsLastMonth`.
- `Donut` — pure SVG, props: `data: { label, value, color }[]`, `size`, `track`.
- `SpendingMixCard` — composes `Donut` + legend.
- `UpcomingCard` — composes `TimelineRail` and `CalendarGrid`, owns the toggle state.
- `TimelineRail` — props: `subscriptions`, `days = 30`.
- `CalendarGrid` — props: `subscriptions`, `month`.
- `TrialsCard` — props: `trials`.
- `PriceChangesCard` — props: `subscriptions` (filters internally to those with `priceChange`).
- `Logo` (replaces favicon `<img>`) — props: `sub`, `size`, `rounded`. Renders a colored monogram in the category color with the first letter of the name. Keep the favicon URL as a fallback the user can opt into.
- `Segment` — small two-/three-segment toggle for the calendar view and the reminder-lead-time picker.

### Mock data the prototype uses

`source/data.js` defines a 12-subscription mock list with realistic services (Netflix, Spotify, ChatGPT Plus, Adobe CC, Notion AI as a trial, Linear, iCloud+, NYT with a recent price hike, 1Password Families, Disney+ as a trial, Backblaze yearly, GitHub Pro). Useful for matching the visual density when stubbing — the real data comes from `loadDashboard(user.id)`.

---

## 9 — Files in this bundle

```
design_handoff_subtracker_redesign/
├── README.md                                ← you are here
├── screenshots/
│   ├── 01-dashboard-top.png                 ← greeting + monthly hero + donut
│   ├── 02-dashboard-donut-timeline.png      ← donut close-up + timeline rail
│   ├── 03-dashboard-calendar-grid.png       ← calendar grid view of upcoming
│   ├── 04-dashboard-trials-table.png        ← trials/price-changes + table
│   ├── 05-detail.png                        ← Spotify detail page
│   ├── 06-settings.png                      ← settings page
│   └── 07-cancelled.png                     ← cancelled subscriptions archive
└── source/                                  ← living prototype, runnable
    ├── index.html
    ├── app.jsx                              ← shell + direction switcher + tweaks wiring
    ├── halo.jsx                             ← THE design to ship — all 4 screens
    ├── aurora.jsx                           ← earlier light/dark direction (reference only)
    ├── eclipse.jsx                          ← darker cool variant (reference only)
    ├── folio.jsx                            ← editorial alt (not shipping)
    ├── data.js                              ← mock subscriptions / aggregations / formatters
    ├── primitives.jsx                       ← shared Icon + Logo components
    └── tweaks-panel.jsx                     ← the floating Tweaks panel (won't be in prod)
```

`source/halo.jsx` is the single most useful file for the implementer — it contains the working layout for every Halo screen with all the inline styles using the exact tokens above. Copy the structure, swap the inline `style={{ color: t.muted }}` for the Tailwind utilities you set up in §5 (`text-muted`, etc.), and replace the mock data hooks with the existing server-data shapes.

---

## 10 — Out of scope for this handoff

- Mobile breakpoint design — desktop only for now. Use the same tokens at smaller sizes; stack the dashboard hero/donut vertically below `md`.
- Onboarding / sign-in screen redesign — leave existing `app/sign-in/page.tsx` as-is.
- Email templates (`lib/emails/`) — leave as-is.
- The "Add subscription" form (`components/subscription-form.tsx`) was not redesigned in this pass. Keep the existing form structure and just retheme the shadcn inputs/labels to use the new tokens. Open question for the user on whether to do a fuller form redesign.

---

## 11 — Questions to ask the user before shipping

1. The greeting line ("Good evening, Ilay") — keep, or replace with the current "Dashboard" page title?
2. Replace favicons with the colored-monogram `Logo`, or keep favicons and only use the monogram when no URL is set?
3. Move the dark-mode toggle from the top nav into Settings, or keep it in the sidebar footer?
4. Should the calendar view (Timeline vs Grid) preference persist to the user record (DB) or live in localStorage?
