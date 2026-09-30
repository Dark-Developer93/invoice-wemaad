import type { ReactNode } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrencyFormatter } from "@/lib/formatCurrency";

interface OutstandingInvoice {
  id: string;
  invoiceName: string;
  total: number;
  currency: string;
  date: Date;
  dueDate: number;
  clientName: string | null;
}

interface OutstandingInvoicesCardProps {
  // The current page of outstanding invoices.
  invoices: OutstandingInvoice[];
  // All outstanding invoices, across every page (for the header count).
  totalCount?: number;
  // Pager rendered under the list (the list is paginated on the server).
  pagination?: ReactNode;
}

export function OutstandingInvoicesCard({
  invoices,
  totalCount = invoices.length,
  pagination,
}: OutstandingInvoicesCardProps) {
  if (totalCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Invoices</CardTitle>
          <CardDescription>All invoices are paid — great work!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-6">No pending invoices.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outstanding Invoices</CardTitle>
        <CardDescription>
          {totalCount} unpaid invoice{totalCount !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {invoices.map((inv) => {
            const due = new Date(inv.date);
            due.setDate(due.getDate() + inv.dueDate);
            const isOverdue = due < new Date();
            const fmt = getCurrencyFormatter(inv.currency).format(inv.total);

            return (
              <li key={inv.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-3">
                <div>
                  <p className="font-medium">{inv.invoiceName}</p>
                  <p className="text-sm text-muted-foreground">
                    {inv.clientName ?? "No client"} · Due {format(due, "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-semibold">{fmt}</span>
                  {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                </div>
              </li>
            );
          })}
        </ul>
        {pagination}
      </CardContent>
    </Card>
  );
}
