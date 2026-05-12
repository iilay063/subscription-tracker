/** Round to 2 decimal places, banker-safe. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
