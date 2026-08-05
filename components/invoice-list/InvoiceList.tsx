import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceActions } from "@/components/invoice-actions/InvoiceActions";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatCurrency } from "@/lib/formatCurrency";
import { calculateInvoiceTotal, parseInvoiceItems } from "@/lib/invoiceItems";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { Currency } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ReactNode } from "react";

async function getData(userId: string) {
  const data = await prisma.invoice.findMany({
    where: {
      userId: userId,
    },
    include: {
      client: {
        select: {
          name: true,
          email: true,
          addresses: true,
          contactPersons: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return data;
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
        <>
          {/* Mobile: card list */}
          <div className="md:hidden space-y-3">
            {data.map((invoice) => (
              <div
                key={invoice.id}
                className="rounded-lg border bg-card p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">#{invoice.invoiceNumber}</span>
                  <Badge>{invoice.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {invoice.client?.name || "—"}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {formatCurrency({
                      amount: calculateInvoiceTotal(parseInvoiceItems(invoice.items)),
                      currency: invoice.currency as Currency,
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                    }).format(invoice.createdAt)}
                  </span>
                </div>
                <div className="flex justify-end pt-1">
                  <InvoiceActions invoice={invoice} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto -mx-1">
            <Table className="min-w-[540px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>#{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.client?.name || "—"}</TableCell>
                    <TableCell>
                      {formatCurrency({
                        amount: calculateInvoiceTotal(parseInvoiceItems(invoice.items)),
                        currency: invoice.currency as Currency,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                      }).format(invoice.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <InvoiceActions invoice={invoice} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </>
  );
}
