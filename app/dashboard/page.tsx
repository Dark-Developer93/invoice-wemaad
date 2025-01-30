import { Suspense } from "react";

import {
  DashboardBlocks,
  DashboardBlocksSkeleton,
} from "@/components/dashboard-blocks/DashboardBlocks";
import { EmptyState } from "@/components/empty-state/EmptyState";
import {
  InvoiceGraph,
  InvoiceGraphSkeleton,
} from "@/components/invoice-graph/InvoiceGraph";
import {
  RecentInvoices,
  RecentInvoicesSkeleton,
} from "@/components/recent-invoices/RecentInvoices";
import { Skeleton } from "@/components/ui/skeleton";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";

async function getData(userId: string) {
  const data = await prisma.invoice.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
    },
  });

  return data;
}

export default async function DashboardRoute() {
  const session = await requireUser();
  const data = await getData(session.user?.id as string);
  return (
    <>
      {data.length < 1 ? (
        <EmptyState
          title="No invoices found"
          description="Create an invoice to see it right here"
          buttontext="Create Invoice"
          href="/dashboard/invoices/create"
        />
      ) : (
        <Suspense fallback={<Skeleton className="w-full h-full flex-1" />}>
          <Suspense fallback={<DashboardBlocksSkeleton />}>
            <DashboardBlocks />
          </Suspense>
          <div className="grid gap-4 lg:grid-cols-3 md:gap-8">
            <Suspense fallback={<InvoiceGraphSkeleton />}>
              <InvoiceGraph />
            </Suspense>
            <Suspense fallback={<RecentInvoicesSkeleton />}>
              <RecentInvoices />
            </Suspense>
          </div>
        </Suspense>
      )}
    </>
  );
}
