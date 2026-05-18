import { listActiveSubscriptionsForUser, listUpcomingForUser } from "@/lib/db/subscriptions";
import { getUserById } from "@/lib/db/users";
import { convert } from "@/lib/external/currency";
import { round2 } from "@/lib/money";
import { monthlyEquivalent, yearlyEquivalent } from "@/lib/billing/dates";
import { resolveCategoryColor } from "@/lib/categories-presets";
import { addDays, startOfDay } from "date-fns";

export type DashboardData = {
  userCurrency: string;
  monthlyTotal: number;
  yearlyTotal: number;
  breakdown: Array<{ category: string; color: string; monthly: number }>;
  upcoming: Array<{
    id: string;
    name: string;
    cost: number;
    currency: string;
    nextBillingDate: Date;
    categoryName: string | null;
    categoryColor: string | null;
  }>;
  subscriptions: Array<{
    id: string;
    name: string;
    cost: number;
    currency: string;
    monthlyInUserCurrency: number;
    nextBillingDate: Date;
    billingCycle: string;
    categoryName: string | null;
    categoryColor: string | null;
  }>;
  ratesNote?: { hoursAgo: number } | null;
};

export async function loadDashboard(userId: string): Promise<DashboardData> {
  const user = await getUserById(userId);
  const userCurrency = user?.preferredCurrency ?? "USD";

  const rows = await listActiveSubscriptionsForUser(userId);

  const now = new Date();
  const upcomingRows = await listUpcomingForUser(
    userId,
    startOfDay(now),
    addDays(now, 30),
  );

  let monthlyTotal = 0;
  let yearlyTotal = 0;
  const byCategory = new Map<string, { color: string; monthly: number }>();
  const subscriptions: DashboardData["subscriptions"] = [];

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
    const prev = byCategory.get(catKey);
    byCategory.set(catKey, {
      color: catColor,
      monthly: (prev?.monthly ?? 0) + monthly,
    });

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
    });
  }

  const upcoming: DashboardData["upcoming"] = upcomingRows.map(
    ({ sub, category }) => ({
      id: sub.id,
      name: sub.name,
      cost: Number(sub.cost),
      currency: sub.currency,
      nextBillingDate: sub.nextBillingDate,
      categoryName: category?.name ?? null,
      categoryColor: resolveCategoryColor(category?.name),
    }),
  );

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
    breakdown,
    upcoming,
    subscriptions,
    ratesNote,
  };
}
