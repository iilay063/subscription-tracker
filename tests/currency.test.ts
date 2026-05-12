import { describe, it, expect } from "vitest";
import { round2, formatMoney } from "@/lib/money";

describe("round2", () => {
  it("rounds standard cases", () => {
    expect(round2(1.234)).toBe(1.23);
    expect(round2(1.235)).toBe(1.24);
    expect(round2(1.005)).toBe(1.01);
    expect(round2(0)).toBe(0);
  });

  it("preserves whole numbers", () => {
    expect(round2(10)).toBe(10);
  });

  it("handles negative numbers", () => {
    expect(round2(-1.235)).toBeCloseTo(-1.24, 5);
  });
});

describe("formatMoney", () => {
  it("formats USD", () => {
    expect(formatMoney(1234.5, "USD")).toBe("$1,234.50");
  });

  it("formats EUR", () => {
    const out = formatMoney(99, "EUR");
    expect(out).toMatch(/99\.00/);
    expect(out).toMatch(/€|EUR/);
  });

  it("falls back gracefully on unknown codes", () => {
    expect(formatMoney(10, "XXX")).toMatch(/XXX|10\.00/);
  });
});
