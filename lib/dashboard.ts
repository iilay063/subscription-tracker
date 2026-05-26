import { listActiveSubscriptionsForUser, listUpcomingForUser } from "@/lib/db/subscriptions";
import { getUserById } from "@/lib/db/users";
import { getRecentBillingPairs } from "@/lib/db/billing-history";
import { convert } from "@/lib/external/currency";
import { round2 } from "@/lib/money";
import { monthlyEquivalent, yearlyEquivalent } from "@/lib/billing/dates";
import { resolveCategoryColor } from "@/lib/categories-presets";
import { addDays, startOfDay } from "date-fns";

export type DashboardSubscription = {
  id: string;
  name: string;
  cost: number;
  currency: string;
  monthlyInUserCurrency: number;
  nextBillingDate: Date;
  billingCycle: string;
  categoryName: string | null;
  categoryColor: string | null;
  faviconUrl: string | null;
  isTrial: boolean;
  trialEndsAt: Date | null;
  priceChange: { previous: number; change: number } | null;
};

export type DashboardUpcoming = {
  id: string;
  name: string;
  cost: number;
  currency: string;
  nextBillingDate: Date;
  categoryName: string | null;
  categoryColor: string | null;
  faviconUrl: string | null;
  isTrial: boolean;
  trialEndsAt: Date | null;
};

export type DashboardData = {
  userCurrency: string;
  monthlyTotal: number;
  yearlyTotal: number;
  monthlyBudget: number | null;
  breakdown: Array<{ category: string; color: string; monthly: number }>;
  upcoming: DashboardUpcoming[];
  subscriptions: DashboardSubscription[];
  categories: string[];
  ratesNote?: { hoursAgo: number } | null;
};

/** Returns a favicon URL for the given subscription URL, or null. */
function faviconFor(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch {
    return null;
  }
}

export async function loadDashboard(userId: string): Promise<DashboardData> {
  const user = await getUserById(userId);
  const userCurrency = user?.preferredCurrency ?? "USD";
  const monthlyBudget = user?.monthlyBudget ? Number(user.monthlyBudget) : null;

  const rows = await listActiveSubscriptionsForUser(userId);

  const now = new Date();
  const upcomingRows = await listUpcomingForUser(
    userId,
    startOfDay(now),
    addDays(now, 30),
  );

  const pairs = await getRecentBillingPairs(rows.map((r) => r.sub.id));

  let monthlyTotal = 0;
  let yearlyTotal = 0;
  const byCategory = new Map<string, { color: string; monthly: number }>();
  const subscriptions: DashboardSubscription[] = [];
  const categorySet = new Set<string>();

  let oldestRateAt: Date | null = null;

  for (const { sub, category } of rows) {
    const cost = Number(sub.cost);
    let converted = cost;
    if (sub.currency !== userCurrency) {
      const result = await convert(cost, sub.currency, userCurrency);
      converted = result.amount;
      if (!oldestRateAt || result.fetchedAt < oldestRateAt) {
        oldestRateAt = result.fetchedAt;
      }
    }
    const monthly = monthlyEquivalent(converted, sub.billingCycle, sub.customDays);
    const yearly = yearlyEquivalent(converted, sub.billingCycle, sub.customDays);
    monthlyTotal += monthly;
    yearlyTotal += yearly;

    const catKey = category?.name ?? "Uncategorized";
    const catColor = resolveCategoryColor(category?.name);
    categorySet.add(catKey);
    const prev = byCategory.get(catKey);
    byCategory.set(catKey, {
      color: catColor,
      monthly: (prev?.monthly ?? 0) + monthly,
    });

    const pair = pairs.get(sub.id);
    const priceChange =
      pair && pair.previous !== null && pair.previous !== pair.latest
        ? { previous: pair.previous, change: pair.latest - pair.previous }
        : null;

    subscriptions.push({
      id: sub.id,
      name: sub.name,
      cost,
      currency: sub.currency,
      monthlyInUserCurrency: round2(monthly),
      nextBillingDate: sub.nextBillingDate,
      billingCycle: sub.billingCycle,
      categoryName: category?.name ?? null,
      categoryColor: catColor,
      faviconUrl: faviconFor(sub.url),
      isTrial: sub.isTrial,
      trialEndsAt: sub.trialEndsAt,
      priceChange,
    });
  }

  const upcoming: DashboardUpcoming[] = upcomingRows.map(({ sub, category }) => ({
    id: sub.id,
    name: sub.name,
    cost: Number(sub.cost),
    currency: sub.currency,
    nextBillingDate: sub.nextBillingDate,
    categoryName: category?.name ?? null,
    categoryColor: resolveCategoryColor(category?.name),
    faviconUrl: faviconFor(sub.url),
    isTrial: sub.isTrial,
    trialEndsAt: sub.trialEndsAt,
  }));

  const breakdown = Array.from(byCategory.entries())
    .map(([category, { color, monthly }]) => ({
      category,
      color,
      monthly: round2(monthly),
    }))
    .sort((a, b) => b.monthly - a.monthly);

  const ratesNote = oldestRateAt
    ? {
        hoursAgo: Math.max(
          0,
          Math.floor((Date.now() - oldestRateAt.getTime()) / (1000 * 60 * 60)),
        ),
      }
    : null;

  return {
    userCurrency,
    monthlyTotal: round2(monthlyTotal),
    yearlyTotal: round2(yearlyTotal),
    monthlyBudget,
    breakdown,
    upcoming,
    subscriptions,
    categories: Array.from(categorySet).sort(),
    ratesNote,
  };
}
