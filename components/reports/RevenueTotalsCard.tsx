import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueTotalsCardProps {
  ytdTotal: number;
  paid: number;
  pending: number;
  currency?: string;
}

// Basic-tier reports view: plain totals, no trend chart, no breakdown table.
// Advanced tiers get RevenueSummaryCard + StatusBreakdownCard instead, which
// chart the same underlying numbers over time and by client.
export function RevenueTotalsCard({
  ytdTotal,
  paid,
  pending,
  currency = "USD",
}: RevenueTotalsCardProps) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(v);

  const stats = [
    { label: "YTD Revenue", value: ytdTotal },
    { label: "Paid", value: paid },
    { label: "Pending", value: pending },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Totals</CardTitle>
        <CardDescription>Year-to-date summary — upgrade for trend charts and a client breakdown</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{fmt(stat.value)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
