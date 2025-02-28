import { unstable_cache } from "next/cache";

import { DashboardBlocks } from "@/components/dashboard-blocks/DashboardBlocks";
import { EmptyState } from "@/components/empty-state/EmptyState";
import {
  InvoiceGraph,
  getInvoiceData,
} from "@/components/invoice-graph/InvoiceGraph";
import RecentInvoices, {
  getRecentInvoices,
} from "@/components/recent-invoices/RecentInvoices";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";

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

  // Fetch all data in parallel
  const [hasInvoices, invoiceGraphData, recentInvoices] = await Promise.all([
    getHasInvoices(session.user.id),
    getInvoiceData(session.user.id),
    getRecentInvoices(session.user.id),
  ]);

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
          <div className="grid gap-4 lg:grid-cols-3 md:gap-8">
            <InvoiceGraph data={invoiceGraphData} />
            <RecentInvoices data={recentInvoices} />
          </div>
        </>
      )}
    </main>
  );
}
