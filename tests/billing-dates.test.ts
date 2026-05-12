import { describe, it, expect } from "vitest";
import {
  advanceBillingDate,
  catchUpBillingDate,
  monthlyEquivalent,
  yearlyEquivalent,
} from "@/lib/billing/dates";

const utc = (y: number, m: number, d: number, h = 12) =>
  new Date(Date.UTC(y, m - 1, d, h, 0, 0));

describe("advanceBillingDate — monthly", () => {
  it("advances by one calendar month", () => {
    expect(advanceBillingDate(utc(2026, 1, 15), "monthly")).toEqual(
      utc(2026, 2, 15),
    );
  });

  it("clamps Jan 31 → Feb 28 in non-leap year", () => {
    expect(advanceBillingDate(utc(2026, 1, 31), "monthly")).toEqual(
      utc(2026, 2, 28),
    );
  });

  it("clamps Jan 31 → Feb 29 in leap year", () => {
    expect(advanceBillingDate(utc(2028, 1, 31), "monthly")).toEqual(
      utc(2028, 2, 29),
    );
  });

  it("honors the explicit anchor when present", () => {
    // After a clamped Jan 31 → Feb 28 step, the next step with anchor=31
    // should land on Mar 31, not Mar 28.
    const afterFeb = advanceBillingDate(utc(2026, 2, 28), "monthly", {
      anchorDayOfMonth: 31,
    });
    expect(afterFeb).toEqual(utc(2026, 3, 31));
  });

  it("month-end anchor across a year boundary", () => {
    expect(advanceBillingDate(utc(2026, 12, 31), "monthly")).toEqual(
      utc(2027, 1, 31),
    );
  });
});

describe("advanceBillingDate — yearly", () => {
  it("Feb 29 leap → Feb 28 non-leap", () => {
    expect(advanceBillingDate(utc(2028, 2, 29), "yearly")).toEqual(
      utc(2029, 2, 28),
    );
  });

  it("yearly with anchor 29 returns to Feb 29 in next leap year", () => {
    const y2029 = advanceBillingDate(utc(2028, 2, 29), "yearly");
    // anchor preserved → 2030 should still target Feb 29 but get Feb 28
    const y2030 = advanceBillingDate(y2029, "yearly", { anchorDayOfMonth: 29 });
    expect(y2030).toEqual(utc(2030, 2, 28));
    const y2031 = advanceBillingDate(y2030, "yearly", { anchorDayOfMonth: 29 });
    expect(y2031).toEqual(utc(2031, 2, 28));
    const y2032 = advanceBillingDate(y2031, "yearly", { anchorDayOfMonth: 29 });
    expect(y2032).toEqual(utc(2032, 2, 29));
  });
});

describe("advanceBillingDate — weekly and custom", () => {
  it("weekly adds 7 days", () => {
    expect(advanceBillingDate(utc(2026, 1, 1), "weekly")).toEqual(
      utc(2026, 1, 8),
    );
  });

  it("custom_days adds the given number of days", () => {
    expect(
      advanceBillingDate(utc(2026, 1, 1), "custom_days", { customDays: 30 }),
    ).toEqual(utc(2026, 1, 31));
  });

  it("custom_days throws without customDays", () => {
    expect(() => advanceBillingDate(utc(2026, 1, 1), "custom_days")).toThrow();
  });
});

describe("catchUpBillingDate", () => {
  it("returns one tick and advances when one cycle overdue", () => {
    const result = catchUpBillingDate(
      utc(2026, 5, 1),
      utc(2026, 5, 20),
      { cycle: "monthly" },
    );
    expect(result.ticks).toHaveLength(1);
    expect(result.ticks[0]).toEqual(utc(2026, 5, 1));
    expect(result.next).toEqual(utc(2026, 6, 1));
  });

  it("catches up across multiple missed cycles", () => {
    const result = catchUpBillingDate(
      utc(2026, 1, 15),
      utc(2026, 5, 20),
      { cycle: "monthly" },
    );
    expect(result.ticks).toHaveLength(5);
    expect(result.next).toEqual(utc(2026, 6, 15));
  });

  it("does nothing when the date is in the future", () => {
    const result = catchUpBillingDate(
      utc(2026, 6, 1),
      utc(2026, 5, 20),
      { cycle: "monthly" },
    );
    expect(result.ticks).toEqual([]);
    expect(result.next).toEqual(utc(2026, 6, 1));
  });

  it("preserves the day-of-month anchor across clamped months", () => {
    const result = catchUpBillingDate(
      utc(2026, 1, 31),
      utc(2026, 4, 15),
      { cycle: "monthly" },
      31,
    );
    expect(result.ticks).toEqual([
      utc(2026, 1, 31),
      utc(2026, 2, 28),
      utc(2026, 3, 31),
    ]);
    expect(result.next).toEqual(utc(2026, 4, 30));
  });
});

describe("monthlyEquivalent / yearlyEquivalent", () => {
  it("monthly passes through", () => {
    expect(monthlyEquivalent(10, "monthly")).toBe(10);
    expect(yearlyEquivalent(10, "monthly")).toBe(120);
  });

  it("yearly divides by 12 / passes through", () => {
    expect(monthlyEquivalent(120, "yearly")).toBe(10);
    expect(yearlyEquivalent(120, "yearly")).toBe(120);
  });

  it("weekly scales by 52/12 monthly and 52 yearly", () => {
    expect(monthlyEquivalent(3, "weekly")).toBeCloseTo(13, 5);
    expect(yearlyEquivalent(3, "weekly")).toBe(156);
  });

  it("custom_days scales by 30/days and 365/days", () => {
    expect(monthlyEquivalent(10, "custom_days", 30)).toBe(10);
    expect(monthlyEquivalent(20, "custom_days", 60)).toBe(10);
    expect(yearlyEquivalent(10, "custom_days", 30)).toBeCloseTo(121.667, 2);
  });
});
