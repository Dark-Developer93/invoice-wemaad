import type { Metadata } from "next";
import type { ComponentType } from "react";
import { Users, FileText, Users2, DollarSign, TrendingUp, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminGetPlatformInsights } from "@/app/actions/admin";
import { RevenueSummaryCard } from "@/components/reports/RevenueSummaryCard";
import { StatusBreakdownCard } from "@/components/reports/StatusBreakdownCard";
import { SignupsChart } from "./SignupsChart";
import { PlanDistributionCard } from "./PlanDistributionCard";

export const metadata: Metadata = {
  title: "Admin – Insights",
  description: "Platform-wide usage, revenue, and growth statistics.",
  robots: { index: false, follow: false },
};

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default async function AdminInsightsPage() {
  const insights = await adminGetPlatformInsights();

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Platform-wide activity, revenue, and growth across all users.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Total Users" value={String(insights.totalUsers)} icon={Users} />
        <StatTile label="Active Users" value={String(insights.activeUsers)} icon={Users} />
        <StatTile label="Total Clients" value={String(insights.totalClients)} icon={Users2} />
        <StatTile label="Total Invoices" value={String(insights.totalInvoices)} icon={FileText} />
        <StatTile label="Total Revenue" value={fmt(insights.totalRevenue)} icon={DollarSign} />
        <StatTile
          label="Est. MRR"
          value={fmt(insights.estimatedMrr)}
          icon={TrendingUp}
        />
      </div>

      {insights.pendingRevenue > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-4 flex items-center gap-3">
            <Clock className="size-5 text-yellow-600 shrink-0" />
            <p className="text-sm">
              <span className="font-medium">{fmt(insights.pendingRevenue)}</span> in pending
              (unpaid) invoices across the platform.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueSummaryCard data={insights.monthlyRevenue} ytdTotal={insights.totalRevenue} />
        <StatusBreakdownCard paid={insights.totalRevenue} pending={insights.pendingRevenue} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SignupsChart data={insights.monthlySignups} />
        <PlanDistributionCard data={insights.planDistribution} totalUsers={insights.totalUsers} />
      </div>

      <p className="text-xs text-muted-foreground">
        Revenue figures assume a single currency (USD) across all users for
        simplicity — invoices issued in other currencies are summed at face
        value rather than converted. Estimated MRR excludes any user on a
        custom-priced plan.
      </p>
    </div>
  );
}
