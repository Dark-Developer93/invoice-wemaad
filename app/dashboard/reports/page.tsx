import { Suspense } from "react";
import { subMonths, format } from "date-fns";
import { requireUser } from "@/lib/session";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RevenueSummaryCard } from "@/components/reports/RevenueSummaryCard";
import { StatusBreakdownCard } from "@/components/reports/StatusBreakdownCard";
import { ClientRevenueTable } from "@/components/reports/ClientRevenueTable";
import { OutstandingInvoicesCard } from "@/components/reports/OutstandingInvoicesCard";
import { UpgradePrompt } from "@/components/upgrade-prompt/UpgradePrompt";
import { getUserUsage } from "@/lib/usage";
import { PLAN_FEATURES } from "@/lib/plans";

export const metadata = {
  title: "Reports | WeMaAd Invoice",
  description: "Financial reports and analytics",
};

async function ReportsContent({ userId }: { userId: string }) {
  const now = new Date();

  const allInvoices = await prisma.invoice.findMany({
    where: { userId },
    select: {
      id: true,
      invoiceName: true,
      total: true,
      status: true,
      date: true,
      dueDate: true,
      currency: true,
      createdAt: true,
      clientId: true,
      client: { select: { id: true, name: true } },
    },
  });

  const monthlyMap: Record<string, number> = {};
  for (let i = 11; i >= 0; i--) {
    const d = subMonths(now, i);
    monthlyMap[format(d, "MMM yy")] = 0;
  }
  for (const inv of allInvoices) {
    if (inv.status === "PAID") {
      const key = format(new Date(inv.createdAt), "MMM yy");
      if (key in monthlyMap) monthlyMap[key] += Number(inv.total);
    }
  }
  const monthlyData = Object.entries(monthlyMap).map(([month, total]) => ({ month, total }));
  const ytdTotal = Object.values(monthlyMap).reduce((a, b) => a + b, 0);

  const paidTotal = allInvoices
    .filter((i) => i.status === "PAID")
    .reduce((a, i) => a + Number(i.total), 0);
  const pendingTotal = allInvoices
    .filter((i) => i.status === "PENDING")
    .reduce((a, i) => a + Number(i.total), 0);

  const clientMap: Record<string, { name: string; total: number; count: number }> = {};
  for (const inv of allInvoices) {
    if (!inv.clientId || !inv.client) continue;
    if (!clientMap[inv.clientId]) {
      clientMap[inv.clientId] = { name: inv.client.name, total: 0, count: 0 };
    }
    clientMap[inv.clientId].total += Number(inv.total);
    clientMap[inv.clientId].count++;
  }
  const clientRevenue = Object.entries(clientMap)
    .map(([clientId, v]) => ({
      clientId,
      clientName: v.name,
      total: v.total,
      invoiceCount: v.count,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const outstanding = allInvoices
    .filter((i) => i.status === "PENDING")
    .map((i) => ({
      id: i.id,
      invoiceName: i.invoiceName,
      total: i.total,
      currency: i.currency,
      date: i.date,
      dueDate: i.dueDate,
      clientName: i.client?.name ?? null,
    }));

  const defaultCurrency = allInvoices[0]?.currency ?? "USD";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="lg:col-span-2">
        <RevenueSummaryCard
          data={monthlyData}
          ytdTotal={ytdTotal}
          currency={defaultCurrency}
        />
      </div>
      <StatusBreakdownCard
        paid={paidTotal}
        pending={pendingTotal}
        currency={defaultCurrency}
      />
      <ClientRevenueTable data={clientRevenue} currency={defaultCurrency} />
      <div className="lg:col-span-2">
        <OutstandingInvoicesCard invoices={outstanding} />
      </div>
    </div>
  );
}

function ReportsContentSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[180px] w-full" />
          </CardContent>
        </Card>
      ))}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default async function ReportsPage() {
  const session = await requireUser();
  const usage = await getUserUsage(session.user!.id!);

  if (!PLAN_FEATURES[usage.plan].analytics) {
    return (
      <UpgradePrompt
        title="Reports"
        description="Financial insights and analytics"
        message={
          <>
            Reports are available on the <strong>Starter</strong> plan and above.
            Upgrade to unlock financial insights.
          </>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Financial insights and analytics</p>
        </div>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <a href="/api/reports/export?format=csv" download="invoices.csv">
            Export CSV
          </a>
        </Button>
      </div>
      <Suspense fallback={<ReportsContentSkeleton />}>
        <ReportsContent userId={session.user!.id!} />
      </Suspense>
    </div>
  );
}
