import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  getDate,
  getDaysInMonth,
  isBefore,
  isSameDay,
  startOfDay,
} from "date-fns";
import type { BillingCycle } from "@/lib/db/schema";

export type CycleInput = {
  cycle: BillingCycle;
  customDays?: number | null;
};

/**
 * Advance a billing date by one cycle.
 *
 * For monthly/yearly cycles where the original day-of-month (the
 * "anchor") doesn't exist in the target month (e.g. Jan 31 → Feb),
 * we clamp to the last day of the target month. The anchor is supplied
 * explicitly so that repeated advancement from "Feb 28" of a monthly
 * subscription that started on the 31st keeps landing on the 31st of
 * months that have it.
 */
export function advanceBillingDate(
  current: Date,
  cycle: BillingCycle,
  opts: { customDays?: number | null; anchorDayOfMonth?: number } = {},
): Date {
  switch (cycle) {
    case "weekly":
      return addWeeks(current, 1);
    case "monthly":
      return addMonthlyWithAnchor(current, 1, opts.anchorDayOfMonth);
    case "yearly":
      return addYearlyWithAnchor(current, 1, opts.anchorDayOfMonth);
    case "custom_days": {
      const days = opts.customDays;
      if (!days || days < 1) {
        throw new Error("custom_days cycle requires a positive customDays");
      }
      return addDays(current, days);
    }
  }
}

function addMonthlyWithAnchor(
  d: Date,
  months: number,
  anchor?: number,
): Date {
  const anchorDay = anchor ?? getDate(d);
  const target = addMonths(d, months);
  const maxDay = getDaysInMonth(target);
  const day = Math.min(anchorDay, maxDay);
  return new Date(
    Date.UTC(
      target.getUTCFullYear(),
      target.getUTCMonth(),
      day,
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds(),
    ),
  );
}

function addYearlyWithAnchor(d: Date, years: number, anchor?: number): Date {
  const anchorDay = anchor ?? getDate(d);
  const target = addYears(d, years);
  const maxDay = getDaysInMonth(target);
  const day = Math.min(anchorDay, maxDay);
  return new Date(
    Date.UTC(
      target.getUTCFullYear(),
      target.getUTCMonth(),
      day,
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds(),
    ),
  );
}

/**
 * Catch-up advance: given an overdue date, advance until it's strictly
 * in the future (or equal to `now`). Returns the new date and how many
 * billing events were skipped along the way (those should be persisted
 * as billing history rows).
 */
export function catchUpBillingDate(
  current: Date,
  now: Date,
  cycle: CycleInput,
  anchorDayOfMonth?: number,
): { next: Date; ticks: Date[] } {
  const ticks: Date[] = [];
  let cursor = current;
  // Guard against runaway loops on bad data.
  for (let i = 0; i < 10_000; i++) {
    if (isBefore(now, cursor) || isSameDay(cursor, now)) break;
    ticks.push(cursor);
    cursor = advanceBillingDate(cursor, cycle.cycle, {
      customDays: cycle.customDays,
      anchorDayOfMonth,
    });
  }
  return { next: cursor, ticks };
}

/** Days from `from` (start of day) to `to` (start of day). Negative if past. */
export function daysUntil(from: Date, to: Date): number {
  return differenceInCalendarDays(startOfDay(to), startOfDay(from));
}

/**
 * Normalize a monthly cost: cost-per-billing converted to per-month.
 * Weekly: cost * 52 / 12. Yearly: cost / 12. Custom: cost * (30 / customDays).
 */
export function monthlyEquivalent(
  cost: number,
  cycle: BillingCycle,
  customDays?: number | null,
): number {
  switch (cycle) {
    case "monthly":
      return cost;
    case "yearly":
      return cost / 12;
    case "weekly":
      return (cost * 52) / 12;
    case "custom_days": {
      if (!customDays || customDays < 1) return 0;
      return cost * (30 / customDays);
    }
  }
}

export function yearlyEquivalent(
  cost: number,
  cycle: BillingCycle,
  customDays?: number | null,
): number {
  switch (cycle) {
    case "monthly":
      return cost * 12;
    case "yearly":
      return cost;
    case "weekly":
      return cost * 52;
    case "custom_days": {
      if (!customDays || customDays < 1) return 0;
      return cost * (365 / customDays);
    }
  }
}
