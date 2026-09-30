"use client";

import {
  CheckCircle,
  DownloadCloudIcon,
  Eye,
  Mail,
  MoreHorizontal,
  Pencil,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import { Prisma } from "@prisma/client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceDialog } from "../invoice-dialog/InvoiceDialog";
import Link from "next/link";
import { ViewInvoiceDialog } from "../invoice-dialog/ViewInvoiceDialog";
import { generateInvoicePDF } from "@/app/actions/generate-invoice";
import { sendReminderEmail } from "@/app/actions/invoices";
import { parseInvoiceItems } from "@/lib/invoiceItems";
import { openAfterMenuCloses } from "@/lib/openAfterMenuCloses";
import { useMountOnFirstOpen } from "@/lib/hooks/useMountOnFirstOpen";

interface iAppProps {
  invoice: Prisma.InvoiceGetPayload<{
    include: {
      client: {
        select: {
          name: true;
          email: true;
          addresses: true;
          contactPersons: true;
        };
      };
    };
  }>;
}

export function InvoiceActions({ invoice }: iAppProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  // Every invoice row renders one of these menus, so mounting both dialogs
  // eagerly meant building a full view dialog + edit form per row on every
  // server render and hydration (the second-hottest function in the server
  // CPU profile under load). Mount each on first open instead, then keep it
  // mounted so its close animation still plays.
  const viewMounted = useMountOnFirstOpen(viewOpen);
  const editMounted = useMountOnFirstOpen(editOpen);

  const handleSendReminder = () => {
    toast.promise(sendReminderEmail(invoice.id), {
      loading: "Sending reminder email...",
      success: "Reminder email sent successfully",
      error: (err: Error) => err.message || "Failed to send reminder email",
    });
  };

  const handleDownload = async () => {
    setIsLoading(true);
    toast.promise(
      generateInvoicePDF(invoice.id).then((arrayBuffer) => {
        const blob = new Blob([arrayBuffer], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);

        // Create temporary link and trigger download
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoice-${invoice.invoiceName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setIsLoading(false);
      }),
      {
        loading: "Preparing your invoice...",
        success: "Invoice downloaded successfully",
        error: "Failed to download invoice",
      }
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="secondary">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => openAfterMenuCloses(setViewOpen)}>
            <Eye className="size-4 mr-2" /> View Invoice
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => openAfterMenuCloses(setEditOpen)}>
            <Pencil className="size-4 mr-2" /> Edit Invoice
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload} disabled={isLoading}>
            <DownloadCloudIcon className="size-4 mr-2" /> Download Invoice
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="text-destructive focus:text-destructive focus:bg-destructive/10">
            <Link href={`/dashboard/invoices/${invoice.id}/delete`}>
              <Trash className="size-4 mr-2" /> Delete Invoice
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSendReminder}>
            <Mail className="size-4 mr-2" /> Reminder Email
          </DropdownMenuItem>
          {invoice.status !== "PAID" && (
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/invoices/${invoice.id}/paid`}>
                <CheckCircle className="size-4 mr-2" /> Mark as Paid
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {viewMounted && (
        <ViewInvoiceDialog
          open={viewOpen}
          onOpenChange={setViewOpen}
          invoice={{
            ...invoice,
            total: Number(invoice.total),
            items: parseInvoiceItems(invoice.items),
          }}
        />
      )}
      {editMounted && (
        <InvoiceDialog open={editOpen} onOpenChange={setEditOpen} invoice={invoice} />
      )}
    </>
  );
}
