import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import { unstable_cache } from "next/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatCurrency } from "@/lib/formatCurrency";
import { cacheTags } from "@/lib/cache";

// Cached until invalidated by revalidateTag(cacheTags.invoices(userId)) in
// every invoice-mutating action — no time-based staleness.
function getDashboardMetrics(userId: string) {
  return unstable_cache(
    async () => {
      // One aggregate query instead of loading every invoice row (three
      // times) just to count and sum them in JS.
      const byStatus = await prisma.invoice.groupBy({
        by: ["status"],
        where: { userId },
        _count: { _all: true },
        _sum: { total: true },
      });

      const countFor = (status: "PAID" | "PENDING") =>
        byStatus.find((row) => row.status === status)?._count._all ?? 0;

      return {
        totalRevenue: byStatus.reduce((acc, row) => acc + Number(row._sum.total ?? 0), 0),
        totalCount: byStatus.reduce((acc, row) => acc + row._count._all, 0),
        paidCount: countFor("PAID"),
        pendingCount: countFor("PENDING"),
      };
    },
    ["dashboard-metrics-v2", userId],
    { tags: [cacheTags.invoices(userId)] }
  )();
}

export async function DashboardBlocks() {
  const session = await requireUser();
  const { totalRevenue, totalCount, paidCount, pendingCount } = await getDashboardMetrics(
    session.user?.id as string
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">
            {formatCurrency({
              amount: totalRevenue,
              currency: "USD",
            })}
          </h2>
          <p className="text-xs text-muted-foreground">Based on total volume</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Invoices Issued
          </CardTitle>
          <Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">+{totalCount}</h2>
          <p className="text-xs text-muted-foreground">Total Invoices Isued!</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
          <CreditCard className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">+{paidCount}</h2>
          <p className="text-xs text-muted-foreground">
            Total Invoices which have been paid!
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Invoices
          </CardTitle>
          <Activity className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">+{pendingCount}</h2>
          <p className="text-xs text-muted-foreground">
            Invoices which are currently pending!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardBlocksSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-[120px] bg-muted animate-pulse rounded" />
            <div className="size-4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-7 w-[100px] mb-1 bg-muted animate-pulse rounded" />
            <div className="h-3 w-[140px] bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
