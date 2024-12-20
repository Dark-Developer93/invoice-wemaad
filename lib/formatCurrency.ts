import { Currency } from "@/types";

interface iAppProps {
  amount: number;
  currency: Currency;
}

export function formatCurrency({ amount, currency }: iAppProps) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}
