"use client";

import { ReactNode } from "react";
import { useControllableOpenState } from "@/lib/hooks/useControllableOpenState";
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
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
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
  open: openProp,
  onOpenChange,
  onSuccess,
  clients = [],
  defaultClientId,
  invoice,
}: InvoiceDialogProps) {
  const [open, setOpen] = useControllableOpenState(openProp, onOpenChange);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  const mode = invoice ? "edit" : "create";

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild onClick={() => setOpen(true)}>
          {trigger}
        </DialogTrigger>
      )}
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
