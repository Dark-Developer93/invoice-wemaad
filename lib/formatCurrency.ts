import { Currency } from "@/types";

interface iAppProps {
  amount: number;
  currency: Currency;
}

// Constructing an Intl.NumberFormat is expensive (it resolves locale data on
// every construction) and this is called for every amount on every rendered
// row — under load it was the single hottest function in the server CPU
// profile. Formatters are immutable, so build one per currency and reuse it.
const formatters = new Map<string, Intl.NumberFormat>();

export function getCurrencyFormatter(currency: string): Intl.NumberFormat {
  let formatter = formatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", { style: "currency", currency });
    formatters.set(currency, formatter);
  }
  return formatter;
}

export function formatCurrency({ amount, currency }: iAppProps) {
  return getCurrencyFormatter(currency).format(amount);
}
