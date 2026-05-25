"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface StatusBreakdownCardProps {
  paid: number;
  pending: number;
  currency?: string;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground))"];

export function StatusBreakdownCard({
  paid,
  pending,
  currency = "USD",
}: StatusBreakdownCardProps) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(v / 100);

  const data = [
    { name: "Paid", value: paid },
    { name: "Pending", value: pending },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Status</CardTitle>
        <CardDescription>
          Paid {fmt(paid)} · Pending {fmt(pending)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            paid: { label: "Paid", color: COLORS[0] },
            pending: { label: "Pending", color: COLORS[1] },
          }}
          className="min-h-[220px]"
        >
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => fmt(value)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
