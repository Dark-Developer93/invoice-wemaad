import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { ClientDialog } from "@/components/client-form/clientDialog";

export const metadata: Metadata = {
  title: "Clients | WeMaAd Invoice",
  description: "Manage your client directory",
};

export default async function ClientsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [clients, user] = await Promise.all([
    prisma.client.findMany({
      where: {
        userId: session.user.id,
      },
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
          where: {
            isDefault: true,
          },
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
          where: {
            isPrimary: true,
          },
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
          select: {
            id: true,
            key: true,
            value: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstName: true,
        lastName: true,
        address: true,
        email: true,
      },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client directory and their information.
          </p>
        </div>
        <ClientDialog />
      </div>

      <DataTable columns={columns} data={clients} userData={user} />
    </div>
  );
}
