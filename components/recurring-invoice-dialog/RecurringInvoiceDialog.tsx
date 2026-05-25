"use client";

import { ReactNode, useState } from "react";
import { Client } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { RecurringInvoiceForm } from "../recurring-invoice-form/RecurringInvoiceForm";

interface RecurringInvoiceDialogProps {
  trigger?: ReactNode;
  clients: Client[];
  defaultFromName?: string;
  defaultFromEmail?: string;
  defaultFromAddress?: string;
}

export function RecurringInvoiceDialog({
  trigger,
  clients,
  defaultFromName,
  defaultFromEmail,
  defaultFromAddress,
}: RecurringInvoiceDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Recurring Invoice</DialogTitle>
          <DialogDescription>
            Set up an invoice template that automatically generates on a regular schedule.
          </DialogDescription>
        </DialogHeader>
        <RecurringInvoiceForm
          clients={clients}
          onSuccess={() => setOpen(false)}
          defaultFromName={defaultFromName}
          defaultFromEmail={defaultFromEmail}
          defaultFromAddress={defaultFromAddress}
        />
      </DialogContent>
    </Dialog>
  );
}
