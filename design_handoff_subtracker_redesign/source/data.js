// Sample subscription data — mix of active, trials, recent price hikes.
// All amounts in USD for simplicity.

window.SAMPLE_USER = {
  name: "Ilay Weizman",
  email: "ilay@example.com",
  preferredCurrency: "USD",
  monthlyBudget: 220,
  reminderLeadDays: 3,
};

// Date helper — relative to today
const today = new Date(2026, 4, 26); // May 26, 2026
const d = (offset) => {
  const x = new Date(today);
  x.setDate(x.getDate() + offset);
  return x;
};

window.TODAY = today;

window.SUBSCRIPTIONS = [
  {
    id: "netflix",
    name: "Netflix",
    domain: "netflix.com",
    cost: 22.99,
    currency: "USD",
    cycle: "monthly",
    category: "Entertainment",
    categoryColor: "#E50914",
    nextBilling: d(4),
    status: "active",
    isTrial: false,
    notes: "Premium 4K plan",
    startedAt: new Date(2021, 2, 14),
    priceChange: { previous: 19.99, change: 3.00, at: d(-32) },
    initial: "N",
  },
  {
    id: "spotify",
    name: "Spotify",
    domain: "spotify.com",
    cost: 11.99,
    currency: "USD",
    cycle: "monthly",
    category: "Entertainment",
    categoryColor: "#1DB954",
    nextBilling: d(2),
    status: "active",
    isTrial: false,
    startedAt: new Date(2019, 7, 3),
    priceChange: { previous: 10.99, change: 1.00, at: d(-18) },
    initial: "S",
  },
  {
    id: "chatgpt",
    name: "ChatGPT Plus",
    domain: "openai.com",
    cost: 20.00,
    currency: "USD",
    cycle: "monthly",
    category: "Productivity",
    categoryColor: "#10A37F",
    nextBilling: d(9),
    status: "active",
    isTrial: false,
    startedAt: new Date(2024, 1, 12),
    initial: "G",
  },
  {
    id: "adobe",
    name: "Adobe Creative Cloud",
    domain: "adobe.com",
    cost: 59.99,
    currency: "USD",
    cycle: "monthly",
    category: "Software",
    categoryColor: "#FA0F00",
    nextBilling: d(11),
    status: "active",
    isTrial: false,
    startedAt: new Date(2022, 8, 1),
    initial: "A",
  },
  {
    id: "notion-ai",
    name: "Notion AI",
    domain: "notion.so",
    cost: 10.00,
    currency: "USD",
    cycle: "monthly",
    category: "Productivity",
    categoryColor: "#000000",
    nextBilling: d(6),
    trialEndsAt: d(6),
    status: "active",
    isTrial: true,
    startedAt: d(-8),
    initial: "N",
  },
  {
    id: "linear",
    name: "Linear",
    domain: "linear.app",
    cost: 8.00,
    currency: "USD",
    cycle: "monthly",
    category: "Productivity",
    categoryColor: "#5E6AD2",
    nextBilling: d(14),
    status: "active",
    isTrial: false,
    startedAt: new Date(2023, 5, 20),
    initial: "L",
  },
  {
    id: "icloud",
    name: "iCloud+ 200GB",
    domain: "icloud.com",
    cost: 2.99,
    currency: "USD",
    cycle: "monthly",
    category: "Cloud Storage",
    categoryColor: "#0A84FF",
    nextBilling: d(18),
    status: "active",
    isTrial: false,
    startedAt: new Date(2020, 0, 5),
    initial: "i",
  },
  {
    id: "nyt",
    name: "The New York Times",
    domain: "nytimes.com",
    cost: 25.00,
    currency: "USD",
    cycle: "monthly",
    category: "News",
    categoryColor: "#000000",
    nextBilling: d(21),
    status: "active",
    isTrial: false,
    startedAt: new Date(2022, 10, 1),
    priceChange: { previous: 17.00, change: 8.00, at: d(-12) },
    initial: "T",
  },
  {
    id: "onepassword",
    name: "1Password Families",
    domain: "1password.com",
    cost: 4.99,
    currency: "USD",
    cycle: "monthly",
    category: "Software",
    categoryColor: "#0572EC",
    nextBilling: d(24),
    status: "active",
    isTrial: false,
    startedAt: new Date(2020, 3, 14),
    initial: "1",
  },
  {
    id: "disney",
    name: "Disney+",
    domain: "disneyplus.com",
    cost: 10.99,
    currency: "USD",
    cycle: "monthly",
    category: "Entertainment",
    categoryColor: "#0E47A1",
    nextBilling: d(12),
    trialEndsAt: d(12),
    status: "active",
    isTrial: true,
    startedAt: d(-2),
    initial: "D",
  },
  {
    id: "backblaze",
    name: "Backblaze",
    domain: "backblaze.com",
    cost: 99.00,
    currency: "USD",
    cycle: "yearly",
    category: "Cloud Storage",
    categoryColor: "#E32400",
    nextBilling: d(94),
    status: "active",
    isTrial: false,
    startedAt: new Date(2021, 6, 8),
    initial: "B",
  },
  {
    id: "github",
    name: "GitHub Pro",
    domain: "github.com",
    cost: 4.00,
    currency: "USD",
    cycle: "monthly",
    category: "Software",
    categoryColor: "#181717",
    nextBilling: d(27),
    status: "active",
    isTrial: false,
    startedAt: new Date(2021, 0, 2),
    initial: "G",
  },
];

window.CANCELLED = [
  {
    id: "hbo",
    name: "HBO Max",
    domain: "max.com",
    cost: 15.99,
    currency: "USD",
    cycle: "monthly",
    category: "Entertainment",
    categoryColor: "#0046FE",
    cancelledAt: new Date(2025, 11, 14),
    startedAt: new Date(2022, 3, 11),
    lifetimeSpend: 671.58,
    initial: "H",
  },
  {
    id: "headspace",
    name: "Headspace",
    domain: "headspace.com",
    cost: 12.99,
    currency: "USD",
    cycle: "monthly",
    category: "Health",
    categoryColor: "#F47B30",
    cancelledAt: new Date(2025, 8, 2),
    startedAt: new Date(2023, 1, 1),
    lifetimeSpend: 415.68,
    initial: "H",
  },
  {
    id: "patreon",
    name: "Patreon (Creator)",
    domain: "patreon.com",
    cost: 8.00,
    currency: "USD",
    cycle: "monthly",
    category: "Entertainment",
    categoryColor: "#FF424D",
    cancelledAt: new Date(2025, 5, 22),
    startedAt: new Date(2024, 4, 1),
    lifetimeSpend: 112.00,
    initial: "P",
  },
];

// Aggregate helpers
window.calcMonthly = (sub) => {
  if (sub.cycle === "monthly") return sub.cost;
  if (sub.cycle === "yearly") return sub.cost / 12;
  if (sub.cycle === "weekly") return (sub.cost * 52) / 12;
  return sub.cost;
};

window.MONTHLY_TOTAL = window.SUBSCRIPTIONS.reduce((s, x) => s + window.calcMonthly(x), 0);
window.YEARLY_TOTAL = window.MONTHLY_TOTAL * 12;

window.CATEGORY_BREAKDOWN = (() => {
  const map = new Map();
  for (const s of window.SUBSCRIPTIONS) {
    const cur = map.get(s.category) ?? { category: s.category, color: s.categoryColor, monthly: 0, count: 0 };
    cur.monthly += window.calcMonthly(s);
    cur.count += 1;
    map.set(s.category, cur);
  }
  return [...map.values()].sort((a, b) => b.monthly - a.monthly);
})();

// Category palette overrides per direction will be applied at render time.

window.fmt = (n, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
};

window.fmtNoCents = (n, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);

window.fmtDate = (dt) =>
  dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });

window.fmtDateLong = (dt) =>
  dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

window.daysUntil = (dt) => {
  const ms = dt.getTime() - window.TODAY.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

// Upcoming 30 days
window.UPCOMING = window.SUBSCRIPTIONS
  .filter((s) => {
    const days = window.daysUntil(s.nextBilling);
    return days >= 0 && days <= 30;
  })
  .sort((a, b) => a.nextBilling - b.nextBilling);
