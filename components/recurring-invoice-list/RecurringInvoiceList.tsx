"use client";

import { useState, useTransition } from "react";
import { RecurringInvoice, Client } from "@prisma/client";
import { format } from "date-fns";
import { MoreHorizontal, Pause, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toggleRecurringInvoice, deleteRecurringInvoice } from "@/app/actions/recurringInvoices";

type RecurringInvoiceWithClient = RecurringInvoice & { client: Client | null };

interface RecurringInvoiceListProps {
  items: RecurringInvoiceWithClient[];
}

const INTERVAL_LABELS: Record<string, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

export function RecurringInvoiceList({ items }: RecurringInvoiceListProps) {
  const [list, setList] = useState(items);
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: string) {
    startTransition(async () => {
      const result = await toggleRecurringInvoice(id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setList((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, isActive: !item.isActive } : item
          )
        );
        toast.success("Updated");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteRecurringInvoice(id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setList((prev) => prev.filter((item) => item.id !== id));
        toast.success("Deleted");
      }
    });
  }

  if (list.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No recurring invoices yet. Create one to get started.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Interval</TableHead>
          <TableHead>Next Run</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.invoiceName}</TableCell>
            <TableCell>{item.client?.name ?? "—"}</TableCell>
            <TableCell>{INTERVAL_LABELS[item.interval]}</TableCell>
            <TableCell>{format(new Date(item.nextRunAt), "MMM d, yyyy")}</TableCell>
            <TableCell>
              {item.endDate ? format(new Date(item.endDate), "MMM d, yyyy") : "—"}
            </TableCell>
            <TableCell>
              <Badge variant={item.isActive ? "default" : "secondary"}>
                {item.isActive ? "Active" : "Paused"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isPending}>
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleToggle(item.id)}>
                    {item.isActive ? (
                      <>
                        <Pause className="size-4 mr-2" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="size-4 mr-2" /> Resume
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(item.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="size-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
