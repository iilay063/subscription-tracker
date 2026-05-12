import "server-only";
import { getCachedRate, upsertRate } from "@/lib/db/exchange-rates";

const TTL_MS = 24 * 60 * 60 * 1000;

export type ConversionResult = {
  rate: number;
  amount: number;
  cached: boolean;
  fetchedAt: Date;
};

export async function getRate(
  base: string,
  quote: string,
): Promise<{ rate: number; fetchedAt: Date; cached: boolean }> {
  base = base.toUpperCase();
  quote = quote.toUpperCase();
  if (base === quote) {
    return { rate: 1, fetchedAt: new Date(), cached: true };
  }

  const cached = await getCachedRate(base, quote);
  if (cached && Date.now() - cached.fetchedAt.getTime() < TTL_MS) {
    return {
      rate: Number(cached.rate),
      fetchedAt: cached.fetchedAt,
      cached: true,
    };
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) {
    if (cached) {
      // No key configured but we have an older cached value — use it.
      return {
        rate: Number(cached.rate),
        fetchedAt: cached.fetchedAt,
        cached: true,
      };
    }
    throw new Error("EXCHANGE_RATE_API_KEY missing and no cached rate");
  }

  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${base}/${quote}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    if (cached) {
      return {
        rate: Number(cached.rate),
        fetchedAt: cached.fetchedAt,
        cached: true,
      };
    }
    throw new Error(`Exchange rate fetch failed: ${res.status}`);
  }
  const data = (await res.json()) as {
    result: string;
    conversion_rate?: number;
    "error-type"?: string;
  };
  if (data.result !== "success" || typeof data.conversion_rate !== "number") {
    if (cached) {
      return {
        rate: Number(cached.rate),
        fetchedAt: cached.fetchedAt,
        cached: true,
      };
    }
    throw new Error(`Exchange rate API error: ${data["error-type"] ?? "unknown"}`);
  }
  const rate = data.conversion_rate;
  await upsertRate(base, quote, rate.toString());
  return { rate, fetchedAt: new Date(), cached: false };
}

export async function convert(
  amount: number,
  from: string,
  to: string,
): Promise<ConversionResult> {
  const { rate, fetchedAt, cached } = await getRate(from, to);
  return { amount: amount * rate, rate, fetchedAt, cached };
}

