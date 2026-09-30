import { PlusIcon } from "lucide-react";
import { unstable_cache } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";

import { InvoiceListClient } from "@/components/invoice-list/InvoiceListClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InvoiceDialog } from "@/components/invoice-dialog/InvoiceDialog";
import { cacheTags } from "@/lib/cache";
import { parsePageParam } from "@/lib/pagination";

// Cached until invalidated by revalidateTag(cacheTags.clients(userId)) in
// every client-mutating action — no time-based staleness.
function getClientsForPicker(userId: string) {
  return unstable_cache(
    () =>
      prisma.client.findMany({
        relationLoadStrategy: "query", // nested to-many lists: see prisma/schema.prisma
        where: { userId },
        include: {
          addresses: {
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
          },
          contactPersons: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              position: true,
              isPrimary: true,
            },
          },
        },
      }),
    ["clients-for-picker", userId],
    { tags: [cacheTags.clients(userId)] }
  )();
}

export const metadata = {
  title: "Invoices",
  description: "View, create, and manage all your invoices.",
  robots: { index: false, follow: false },
};

export default async function InvoicesRoute({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const page = parsePageParam((await searchParams).page);
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const clients = await getClientsForPicker(session.user.id);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-2xl font-bold">Invoices</CardTitle>
            <CardDescription>Manage your invoices right here</CardDescription>
          </div>
          <InvoiceDialog
            trigger={
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" /> Create Invoice
              </Button>
            }
            clients={clients}
          />
        </div>
      </CardHeader>
      <CardContent>
        {/* The list loads as JSON (/api/invoices) so this page stays a light shell. */}
        <InvoiceListClient
            page={page}
            renderedAt={Date.now()}
            emptyButton={
              <InvoiceDialog
                trigger={
                  <Button>
                    <PlusIcon className="mr-2 h-4 w-4" /> Create Invoice
                  </Button>
                }
                clients={clients}
              />
            }
          />
      </CardContent>
    </Card>
  );
}
