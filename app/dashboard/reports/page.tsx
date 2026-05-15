import { redirect } from "next/navigation";
import { subMonths, format } from "date-fns";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
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

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const usage = await getUserUsage(session.user.id);
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

  const userId = session.user.id;
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

  // Monthly revenue (last 12 months)
  const monthlyMap: Record<string, number> = {};
  for (let i = 11; i >= 0; i--) {
    const d = subMonths(now, i);
    monthlyMap[format(d, "MMM yy")] = 0;
  }
  for (const inv of allInvoices) {
    if (inv.status === "PAID") {
      const key = format(new Date(inv.createdAt), "MMM yy");
      if (key in monthlyMap) monthlyMap[key] += inv.total;
    }
  }
  const monthlyData = Object.entries(monthlyMap).map(([month, total]) => ({ month, total }));
  const ytdTotal = Object.values(monthlyMap).reduce((a, b) => a + b, 0);

  // Status breakdown
  const paidTotal = allInvoices
    .filter((i) => i.status === "PAID")
    .reduce((a, i) => a + i.total, 0);
  const pendingTotal = allInvoices
    .filter((i) => i.status === "PENDING")
    .reduce((a, i) => a + i.total, 0);

  // Client revenue (top 10) — derived from the already-loaded allInvoices slice
  const clientMap: Record<string, { name: string; total: number; count: number }> = {};
  for (const inv of allInvoices) {
    if (!inv.clientId || !inv.client) continue;
    if (!clientMap[inv.clientId]) {
      clientMap[inv.clientId] = { name: inv.client.name, total: 0, count: 0 };
    }
    clientMap[inv.clientId].total += inv.total;
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

  // Outstanding invoices
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

  const defaultCurrency =
    allInvoices[0]?.currency ?? "USD";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Financial insights and analytics</p>
        </div>
        <Button variant="outline" asChild>
          <a href="/api/reports/export?format=csv" download="invoices.csv">
            Export CSV
          </a>
        </Button>
      </div>

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
    </div>
  );
}
