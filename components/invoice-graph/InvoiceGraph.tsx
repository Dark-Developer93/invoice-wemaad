"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Graph, ChartType } from "@/components/graph/Graph";

interface DataPoint {
  date: number;
  amount: number;
}

type DateRange = 7 | 30 | 90;
type StatusFilter = "PAID" | "PENDING" | "ALL";

export function InvoiceGraph() {
  const [chartType, setChartType] = useState<ChartType>("line");
  const [dateRange, setDateRange] = useState<DateRange>(30);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PAID");
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({
        range: dateRange.toString(),
        status: statusFilter === "ALL" ? "" : statusFilter,
      });
      const res = await fetch(`/api/dashboard/chart-data?${params}`);
      if (!res.ok) throw new Error("Failed to fetch chart data");
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [dateRange, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Invoice Revenue</CardTitle>
            <CardDescription>
              {statusFilter === "ALL" ? "All" : statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()} invoices
              {" "}· last {dateRange} days
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Tabs
              value={dateRange.toString()}
              onValueChange={(v) => setDateRange(Number(v) as DateRange)}
            >
              <TabsList>
                <TabsTrigger value="7">7d</TabsTrigger>
                <TabsTrigger value="30">30d</TabsTrigger>
                <TabsTrigger value="90">90d</TabsTrigger>
              </TabsList>
            </Tabs>
            <ToggleGroup
              type="single"
              value={statusFilter}
              onValueChange={(v) => { if (v) setStatusFilter(v as StatusFilter); }}
              size="sm"
            >
              <ToggleGroupItem value="PAID">Paid</ToggleGroupItem>
              <ToggleGroupItem value="PENDING">Pending</ToggleGroupItem>
              <ToggleGroupItem value="ALL">All</ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup
              type="single"
              value={chartType}
              onValueChange={(v) => { if (v) setChartType(v as ChartType); }}
              size="sm"
            >
              <ToggleGroupItem value="line">Line</ToggleGroupItem>
              <ToggleGroupItem value="bar">Bar</ToggleGroupItem>
              <ToggleGroupItem value="pie">Pie</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : error ? (
          <p className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Failed to load chart data. Please try again.
          </p>
        ) : (
          <Graph data={data} chartType={chartType} />
        )}
      </CardContent>
    </Card>
  );
}

export function InvoiceGraphSkeleton() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <Skeleton className="h-6 w-[140px] mb-2" />
        <Skeleton className="h-4 w-[250px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[350px] w-full" />
      </CardContent>
    </Card>
  );
}
