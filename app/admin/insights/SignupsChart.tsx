"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface MonthlySignups {
  month: string;
  count: number;
}

export function SignupsChart({ data }: { data: MonthlySignups[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Signups</CardTitle>
        <CardDescription>Last 12 months · {total} new users</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ count: { label: "Signups", color: "hsl(var(--primary))" } }}
          className="min-h-[250px] w-full"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis width={32} tick={{ fontSize: 11 }} allowDecimals={false} />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
                      <p className="font-medium">{payload[0].payload.month}</p>
                      <p>{payload[0].value} new user{payload[0].value === 1 ? "" : "s"}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
