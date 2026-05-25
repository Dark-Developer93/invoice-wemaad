import Link from "next/link";
import { unstable_cache } from "next/cache";

import { DashboardBlocks } from "@/components/dashboard-blocks/DashboardBlocks";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { InvoiceGraph } from "@/components/invoice-graph/InvoiceGraph";
import RecentInvoices, {
  getRecentInvoices,
} from "@/components/recent-invoices/RecentInvoices";
import { Card } from "@/components/ui/card";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";
import { PLAN_FEATURES, PlanType } from "@/lib/plans";

// Cache the invoice check for 1 minute
const getHasInvoices = unstable_cache(
  async (userId: string) => {
    const count = await prisma.invoice.count({
      where: { userId },
    });
    return count > 0;
  },
  ["has-invoices"],
  { revalidate: 60 }
);

// Add metadata for better SEO and caching
export const metadata = {
  title: "Dashboard | WeMaAd Invoice",
  description: "View your invoice dashboard",
};

// Change to ISR with 1 minute revalidation
export const revalidate = 60;

export default async function DashboardRoute() {
  const session = await requireUser();

  if (!session?.user?.id) {
    return null;
  }

  const [hasInvoices, recentInvoices, user] = await Promise.all([
    getHasInvoices(session.user.id),
    getRecentInvoices(session.user.id),
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id }, select: { plan: true } }),
  ]);

  const planFeatures = PLAN_FEATURES[user.plan as PlanType];

  return (
    <main className="p-4 flex flex-col gap-5">
      {!hasInvoices ? (
        <EmptyState
          title="No invoices found"
          description="Create an invoice to see it right here"
          buttontext="Create Invoice"
          href="/dashboard/invoices/create"
        />
      ) : (
        <>
          <DashboardBlocks />
          {planFeatures.analytics ? (
            <div className="grid gap-4 lg:grid-cols-3 md:gap-8">
              <InvoiceGraph />
              <RecentInvoices data={recentInvoices} />
            </div>
          ) : (
            <Card className="p-6 text-center border-dashed">
              <p className="text-muted-foreground mb-2">
                Analytics are available on Starter and higher plans.
              </p>
              <Link
                href="/dashboard/billing"
                className="text-primary text-sm underline"
              >
                Upgrade your plan →
              </Link>
            </Card>
          )}
        </>
      )}
    </main>
  );
}
