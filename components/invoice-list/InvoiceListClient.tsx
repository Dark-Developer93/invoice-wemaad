"use client";

import { useEffect, useState, type ReactNode } from "react";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { PaginationControls } from "@/components/pagination-controls/PaginationControls";
import type { InvoiceListPage } from "@/lib/invoiceList";
import { InvoiceListView } from "./InvoiceListView";
import { InvoiceListSkeleton } from "./InvoiceListSkeleton";

// The invoices page renders as a light shell and this component loads the
// list as JSON from /api/invoices (like the dashboard chart already does), so
// an in-app navigation to the page doesn't render every row on the server.
//
// `renderedAt` changes on every server render of the page — navigations,
// router.refresh() after an edit, the redirect after mark-as-paid/delete —
// which is the signal to refetch, since the list lives outside the RSC tree.
export function InvoiceListClient({
  page,
  renderedAt,
  emptyButton,
}: {
  page: number;
  renderedAt: number;
  emptyButton?: ReactNode;
}) {
  const [data, setData] = useState<InvoiceListPage | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetch(`/api/invoices?page=${page}`, { signal: controller.signal, cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load invoices (${res.status})`);
        return res.json() as Promise<InvoiceListPage>;
      })
      .then(setData)
      .catch((err) => {
        if (err.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [page, renderedAt]);

  if (error && !data) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Failed to load invoices. Please try again.
      </p>
    );
  }

  // First load only; later refetches keep showing the current rows.
  if (!data) return <InvoiceListSkeleton />;

  return (
    <>
      {data.totalCount === 0 ? (
        <EmptyState
          title="No invoices found"
          description="Create an invoice to get started"
          button={emptyButton}
          buttontext="Create invoice"
          href="/dashboard/invoices"
        />
      ) : (
        <InvoiceListView rows={data.rows} />
      )}
      <PaginationControls
        page={data.pageInfo.page}
        pageCount={data.pageInfo.pageCount}
        hrefForPage={(p) => (p === 1 ? "/dashboard/invoices" : `/dashboard/invoices?page=${p}`)}
      />
    </>
  );
}
