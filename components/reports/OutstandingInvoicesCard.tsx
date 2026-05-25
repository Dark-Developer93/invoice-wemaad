import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  invoices: OutstandingInvoice[];
}

export function OutstandingInvoicesCard({ invoices }: OutstandingInvoicesCardProps) {
  if (invoices.length === 0) {
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
          {invoices.length} unpaid invoice{invoices.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {invoices.map((inv) => {
            const due = new Date(inv.date);
            due.setDate(due.getDate() + inv.dueDate);
            const isOverdue = due < new Date();
            const fmt = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: inv.currency,
            }).format(inv.total / 100);

            return (
              <li key={inv.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{inv.invoiceName}</p>
                  <p className="text-sm text-muted-foreground">
                    {inv.clientName ?? "No client"} · Due {format(due, "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{fmt}</span>
                  {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
