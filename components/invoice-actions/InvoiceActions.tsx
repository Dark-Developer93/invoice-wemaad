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

  const handleSendReminder = () => {
    toast.promise(
      fetch(`/api/email/${invoice.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      {
        loading: "Sending reminder email...",
        success: "Reminder email sent successfully",
        error: "Failed to send reminder email",
      }
    );
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const arrayBuffer = await generateInvoicePDF(invoice.id);

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

      toast.success("Invoice downloaded successfully");
    } catch (error) {
      toast.error("Failed to download invoice");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="secondary">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <ViewInvoiceDialog
            invoice={invoice}
            trigger={
              <div className="flex items-center w-full">
                <Eye className="size-4 mr-2" /> View Invoice
              </div>
            }
          />
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <InvoiceDialog
            invoice={invoice}
            trigger={
              <div className="flex items-center w-full">
                <Pencil className="size-4 mr-2" /> Edit Invoice
              </div>
            }
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownload} disabled={isLoading}>
          <DownloadCloudIcon className="size-4 mr-2" /> Download Invoice
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
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
  );
}
