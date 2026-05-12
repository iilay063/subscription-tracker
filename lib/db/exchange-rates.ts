import { db } from "./index";
import { exchangeRatesCache } from "./schema";
import { and, eq } from "drizzle-orm";

export async function getCachedRate(base: string, quote: string) {
  const rows = await db
    .select()
    .from(exchangeRatesCache)
    .where(
      and(
        eq(exchangeRatesCache.baseCurrency, base),
        eq(exchangeRatesCache.quoteCurrency, quote),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertRate(base: string, quote: string, rate: string) {
  await db
    .insert(exchangeRatesCache)
    .values({
      baseCurrency: base,
      quoteCurrency: quote,
      rate,
      fetchedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [exchangeRatesCache.baseCurrency, exchangeRatesCache.quoteCurrency],
      set: { rate, fetchedAt: new Date() },
    });
}
