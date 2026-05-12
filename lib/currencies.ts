export const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "ILS",
  "CAD",
  "AUD",
  "JPY",
  "INR",
  "NGN",
  "BRL",
  "MXN",
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number];
