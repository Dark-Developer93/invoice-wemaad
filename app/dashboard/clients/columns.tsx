"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ClientDialog } from "@/components/client-form/clientDialog";
import { useRouter } from "next/navigation";
import { InvoiceDialog } from "@/components/invoice-dialog/InvoiceDialog";
import { ViewClientDialog } from "@/components/client-dialog/ViewClientDialog";

export type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  category: string | null;
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
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  taxId: string | null;
  website: string | null;
  notes: string | null;
  tags: string[];
};

interface TableMeta {
  userData: {
    firstName: string | null;
    lastName: string | null;
    address: string | null;
    email: string;
    companyName?: string;
    companyEmail?: string;
    companyAddress?: string;
  };
  allClients: Client[];
}

interface ActionCellProps {
  client: Client;
  userData: TableMeta["userData"];
  allClients: TableMeta["allClients"];
}

function ActionCell({ client, userData, allClients }: ActionCellProps) {
  const router = useRouter();
  const clientWithRequiredFields = {
    ...client,
    customFields: client.customFields || [],
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            router.push(`/dashboard/clients/${client.id}`);
          }}
        >
          <span className="w-full">Full View</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <ViewClientDialog
            client={client}
            trigger={<span className="w-full">Quick View</span>}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <ClientDialog
            client={clientWithRequiredFields}
            trigger={<span className="w-full">Edit Client</span>}
            onSuccess={() => router.refresh()}
          />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <InvoiceDialog
            firstName={userData.firstName || ""}
            lastName={userData.lastName || ""}
            address={userData.address || ""}
            email={userData.email}
            companyName={userData.companyName || ""}
            companyEmail={userData.companyEmail || ""}
            companyAddress={userData.companyAddress || ""}
            clients={allClients.map((client) => ({
              ...client,
              addresses: client.addresses
                .filter((addr) => addr.id)
                .map((addr) => ({ ...addr, id: addr.id! })),
              contactPersons: client.contactPersons
                .filter((contact) => contact.id)
                .map((contact) => ({ ...contact, id: contact.id! })),
            }))}
            defaultClientId={client.id}
            trigger={<span className="w-full">Create Invoice</span>}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <div className="whitespace-normal">{row.getValue("name")}</div>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return <div className="whitespace-normal">{row.getValue("email")}</div>;
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      return <div className="whitespace-normal">{row.getValue("phone")}</div>;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string | null;
      return category ? <Badge variant="secondary">{category}</Badge> : null;
    },
  },
  {
    accessorKey: "addresses",
    header: "Primary Address",
    cell: ({ row }) => {
      const addresses = row.getValue("addresses") as Client["addresses"];
      const primaryAddress = addresses[0];
      if (!primaryAddress) return null;
      return (
        <div className="text-sm whitespace-normal max-w-[200px]">
          {[
            primaryAddress.street,
            primaryAddress.city,
            primaryAddress.state,
            primaryAddress.country,
          ]
            .filter(Boolean)
            .join(", ")}
        </div>
      );
    },
  },
  {
    accessorKey: "contactPersons",
    header: "Primary Contact",
    cell: ({ row }) => {
      const contacts = row.getValue(
        "contactPersons"
      ) as Client["contactPersons"];
      const primaryContact = contacts[0];
      if (!primaryContact) return null;
      return (
        <div className="text-sm whitespace-normal max-w-[200px]">
          <div>
            {primaryContact.firstName} {primaryContact.lastName}
          </div>
          <div className="text-muted-foreground">{primaryContact.email}</div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const client = row.original;
      const meta = table.options.meta as TableMeta;
      return (
        <ActionCell
          client={client}
          userData={meta.userData}
          allClients={meta.allClients}
        />
      );
    },
  },
];
