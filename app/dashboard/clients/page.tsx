import { Metadata } from "next";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { ClientDialog } from "@/components/client-form/clientDialog";
import { EmptyState } from "@/components/empty-state/EmptyState";

export const metadata: Metadata = {
  title: "Clients | WeMaAd Invoice",
  description: "Manage your client directory",
};

export default async function ClientsPage() {
  const session = await requireUser();

  const clients = await prisma.client.findMany({
    where: { userId: session.user!.id! },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      category: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      taxId: true,
      website: true,
      notes: true,
      tags: true,
      addresses: {
        where: { isDefault: true },
        select: {
          id: true,
          type: true,
          street: true,
          city: true,
          state: true,
          country: true,
          zipCode: true,
          isDefault: true,
        },
        take: 1,
      },
      contactPersons: {
        where: { isPrimary: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          position: true,
          isPrimary: true,
        },
        take: 1,
      },
      customFields: {
        select: { id: true, key: true, value: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Manage your client directory and their information.
          </p>
        </div>
        <ClientDialog />
      </div>

      {clients.length === 0 ? (
        <EmptyState
          title="No clients found"
          description="Add your first client to start creating invoices."
          button={<ClientDialog />}
        />
      ) : (
        <DataTable columns={columns} data={clients} />
      )}
    </div>
  );
}
