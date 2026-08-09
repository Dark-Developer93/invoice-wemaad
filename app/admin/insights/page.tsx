import type { Metadata } from "next";
import type { ComponentType } from "react";
import { Users, FileText, Users2, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminGetPlatformInsights } from "@/app/actions/admin";
import { SignupsChart } from "./SignupsChart";
import { PlanDistributionCard } from "./PlanDistributionCard";

export const metadata: Metadata = {
  title: "Admin – Insights",
  description: "Platform-wide usage and growth statistics.",
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
          Platform-wide activity and growth. This deliberately excludes any
          figure derived from what users bill their own clients — invoice
          amounts are those users&apos; business data, not the platform&apos;s.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatTile label="Total Users" value={String(insights.totalUsers)} icon={Users} />
        <StatTile label="Active Users" value={String(insights.activeUsers)} icon={Users} />
        <StatTile label="Total Clients" value={String(insights.totalClients)} icon={Users2} />
        <StatTile label="Total Invoices" value={String(insights.totalInvoices)} icon={FileText} />
        <StatTile label="Est. MRR" value={fmt(insights.estimatedMrr)} icon={TrendingUp} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SignupsChart data={insights.monthlySignups} />
        <PlanDistributionCard data={insights.planDistribution} totalUsers={insights.totalUsers} />
      </div>

      <p className="text-xs text-muted-foreground">
        Estimated MRR is the platform&apos;s own subscription revenue (each
        plan&apos;s price × its subscriber count) — it excludes any user on a
        custom-priced plan, and is not derived from anything users invoice
        their own clients for.
      </p>
    </div>
  );
}
