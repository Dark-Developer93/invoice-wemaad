"use client";

import { ReactNode, useState } from "react";
import { Prisma, Client } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { InvoiceForm } from "../invoice-form/InvoiceForm";

interface InvoiceDialogProps {
  // Common props
  trigger?: ReactNode;
  onSuccess?: () => void;
  // Create mode props
  firstName?: string;
  lastName?: string;
  address?: string;
  email?: string;
  companyName?: string;
  companyEmail?: string;
  companyAddress?: string;
  defaultClientId?: string;
  clients?: (Client & {
    addresses: Array<{
      id: string;
      type: "BILLING" | "SHIPPING" | "OTHER";
      street: string;
      city: string;
      state: string | null;
      country: string;
      zipCode: string;
      isDefault: boolean;
    }>;
    contactPersons: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
      position: string | null;
      isPrimary: boolean;
    }>;
  })[];
  // Edit mode props
  invoice?: Prisma.InvoiceGetPayload<{
    include: {
      client: {
        select: {
          name: true;
          email: true;
          addresses: {
            select: {
              street: true;
              isDefault: true;
            };
          };
        };
      };
    };
  }>;
}

export function InvoiceDialog({
  trigger,
  onSuccess,
  firstName = "",
  lastName = "",
  address = "",
  email = "",
  companyName,
  companyEmail,
  companyAddress,
  clients = [],
  defaultClientId,
  invoice,
}: InvoiceDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  const mode = invoice ? "edit" : "create";

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Invoice" : "Edit Invoice"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new invoice for your client."
              : "Modify the existing invoice details."}
          </DialogDescription>
        </DialogHeader>
        <InvoiceForm
          mode={mode}
          firstName={firstName}
          lastName={lastName}
          address={address}
          email={email}
          companyName={companyName}
          companyEmail={companyEmail}
          companyAddress={companyAddress}
          clients={clients}
          defaultClientId={defaultClientId}
          data={invoice}
          onSuccess={handleSuccess}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
