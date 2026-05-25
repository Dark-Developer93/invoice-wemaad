export const CURRENCY_OPTIONS = [
  { value: "USD", label: "United States Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "EGP", label: "Egyptian Pound (EGP)" },
] as const;

export type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]["value"];
