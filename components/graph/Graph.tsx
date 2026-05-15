"use client";

import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

export type ChartType = "line" | "bar" | "pie";

interface DataPoint {
  date: number;
  amount: number;
}

interface iAppProps {
  data: DataPoint[];
  chartType?: ChartType;
}

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(220 70% 50%)",
  "hsl(160 60% 45%)",
  "hsl(30 80% 55%)",
  "hsl(280 65% 60%)",
];

function AmountTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DataPoint; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
          <span className="font-bold text-muted-foreground">
            {format(payload[0].payload.date, "PPP")}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">Amount</span>
          <span className="font-bold">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
              payload[0].value
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export function Graph({ data, chartType = "line" }: iAppProps) {
  const chartConfig = {
    amount: { label: "Amount", color: "hsl(var(--primary))" },
  };

  if (chartType === "pie") {
    const pieData = data.map((d) => ({
      name: format(d.date, "MMM d"),
      value: d.amount,
    }));

    return (
      <ChartContainer config={chartConfig} className="min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110}>
              {pieData.map((_, index) => (
                <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
                    <p className="font-medium">{payload[0].name}</p>
                    <p>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(payload[0].value as number)}
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  }

  if (chartType === "bar") {
    return (
      <ChartContainer config={chartConfig} className="min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="date" tickFormatter={(v) => format(v, "MMM d")} />
            <YAxis />
            <ChartTooltip content={({ active, payload }) => (
              <AmountTooltip active={active} payload={payload as { payload: DataPoint; value: number }[]} />
            )} />
            <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" tickFormatter={(value) => format(value, "MMM d")} />
          <YAxis />
          <ChartTooltip content={({ active, payload }) => (
            <AmountTooltip active={active} payload={payload as { payload: DataPoint; value: number }[]} />
          )} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="var(--color-amount)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
