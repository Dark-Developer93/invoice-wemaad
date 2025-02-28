"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClientForm } from "./clientForm";
import { Client } from "@/app/dashboard/clients/columns";
import { Plus } from "lucide-react";

interface ClientDialogProps {
  client?: Client & {
    addresses: Array<{
      id?: string;
      type: "BILLING" | "SHIPPING" | "OTHER";
      street: string;
      city: string;
      state: string | null;
      country: string;
      zipCode: string;
      isDefault: boolean;
    }>;
    contactPersons: Array<{
      id?: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
      position: string | null;
      isPrimary: boolean;
    }>;
    customFields: Array<{
      id?: string;
      key: string;
      value: string;
    }>;
  };
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ClientDialog({
  client,
  trigger,
  onSuccess,
}: ClientDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {client ? "Edit Client" : "Create New Client"}
          </DialogTitle>
        </DialogHeader>
        <ClientForm
          client={client}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            onSuccess?.();
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
