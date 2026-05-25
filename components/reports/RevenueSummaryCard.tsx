"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface MonthlyRevenue {
  month: string;
  total: number;
}

interface RevenueSummaryCardProps {
  data: MonthlyRevenue[];
  ytdTotal: number;
  currency?: string;
}

export function RevenueSummaryCard({
  data,
  ytdTotal,
  currency = "USD",
}: RevenueSummaryCardProps) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(ytdTotal / 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Summary</CardTitle>
        <CardDescription>
          Monthly revenue for the last 12 months · YTD: {formatted}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ total: { label: "Revenue", color: "hsl(var(--primary))" } }}
          className="min-h-[250px]"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
                      <p className="font-medium">{payload[0].payload.month}</p>
                      <p>
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency,
                        }).format((payload[0].value as number) / 100)}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
