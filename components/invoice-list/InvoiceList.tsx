import { InvoiceListView } from "./InvoiceListView";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatCurrency } from "@/lib/formatCurrency";
import { calculateInvoiceTotal, parseInvoiceItems } from "@/lib/invoiceItems";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { Currency } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ReactNode } from "react";
import { unstable_cache } from "next/cache";
import { cacheTags } from "@/lib/cache";
import { formatDate } from "@/lib/formatDate";

// Cached until invalidated by revalidateTag(cacheTags.invoices(userId)) in
// every invoice-mutating action — no time-based staleness.
async function getData(userId: string) {
  const data = await unstable_cache(
    () =>
      prisma.invoice.findMany({
        relationLoadStrategy: "query", // nested to-many lists: see prisma/schema.prisma
        where: {
          userId: userId,
        },
        include: {
          // Each row ships this to the client (InvoiceActions props), so only
          // send what its view/edit dialogs actually show — the default
          // address and primary contact, not every one the client has.
          client: {
            select: {
              name: true,
              email: true,
              addresses: { orderBy: { isDefault: "desc" }, take: 1 },
              contactPersons: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ["invoice-list", userId],
    { tags: [cacheTags.invoices(userId)] }
  )();

  // unstable_cache serializes its return value, so Date fields come back as
  // ISO strings on a cache hit — normalize back to Date so callers always
  // get the same shape regardless of cache hit/miss (new Date() is a no-op
  // on an already-real Date).
  return data.map((invoice) => ({
    ...invoice,
    date: new Date(invoice.date),
    createdAt: new Date(invoice.createdAt),
    updatedAt: new Date(invoice.updatedAt),
  }));
}

function InvoiceListSkeleton() {
  return (
    <>
      {/* Mobile skeleton */}
      <div className="md:hidden space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop skeleton */}
      <div className="hidden md:block rounded-md border">
        <div className="border-b">
          <div className="grid grid-cols-6 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24 ml-auto" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b">
            <div className="grid grid-cols-6 p-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-20 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export { InvoiceListSkeleton };

export async function InvoiceList({ emptyButton }: { emptyButton?: ReactNode }) {
  const session = await requireUser();
  const data = await getData(session.user?.id as string);
  return (
    <>
      {data.length === 0 ? (
        <EmptyState
          title="No invoices found"
          description="Create an invoice to get started"
          button={emptyButton}
          buttontext="Create invoice"
          href="/dashboard/invoices"
        />
      ) : (
        <InvoiceListView
          rows={data.map((invoice) => ({
            invoice,
            amountLabel: formatCurrency({
              amount: calculateInvoiceTotal(parseInvoiceItems(invoice.items)),
              currency: invoice.currency as Currency,
            }),
            dateLabel: formatDate.short(invoice.createdAt),
          }))}
        />
      )}
    </>
  );
}
