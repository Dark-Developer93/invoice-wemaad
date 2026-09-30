"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InvoiceActions } from "@/components/invoice-actions/InvoiceActions";
import type { ComponentProps } from "react";

export interface InvoiceListRow {
  // Full invoice, needed by the row's actions menu (view/edit dialogs).
  invoice: ComponentProps<typeof InvoiceActions>["invoice"];
  // Pre-formatted on the server so SSR and the browser always render the
  // same text (a date formatted in the viewer's timezone could differ from
  // the server's and cause a hydration mismatch).
  amountLabel: string;
  dateLabel: string;
}

// Rendered as a client component on purpose. As a server component, every
// row's markup (twice: the mobile card list and the desktop table) was sent
// to the browser a second time inside the RSC payload for hydration — about
// 230 KB for 40 invoices, and most of this page's server CPU. As a client
// component the server still renders identical HTML, but the payload only
// carries the row data.
export function InvoiceListView({ rows }: { rows: InvoiceListRow[] }) {
  return (
    <>
      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {rows.map(({ invoice, amountLabel, dateLabel }) => (
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
              <span>{amountLabel}</span>
              <span className="text-xs text-muted-foreground">{dateLabel}</span>
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
            {rows.map(({ invoice, amountLabel, dateLabel }) => (
              <TableRow key={invoice.id}>
                <TableCell>#{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.client?.name || "—"}</TableCell>
                <TableCell>{amountLabel}</TableCell>
                <TableCell>
                  <Badge>{invoice.status}</Badge>
                </TableCell>
                <TableCell>{dateLabel}</TableCell>
                <TableCell className="text-right">
                  <InvoiceActions invoice={invoice} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
