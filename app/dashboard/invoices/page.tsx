import { Suspense } from "react";
import { PlusIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";

import {
  InvoiceList,
  InvoiceListSkeleton,
} from "@/components/invoice-list/InvoiceList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InvoiceDialog } from "@/components/invoice-dialog/InvoiceDialog";

export const metadata = {
  title: "Invoices",
  description: "View, create, and manage all your invoices.",
  robots: { index: false, follow: false },
};

export default async function InvoicesRoute() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
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
  });

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
        <Suspense fallback={<InvoiceListSkeleton />}>
          <InvoiceList
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
        </Suspense>
      </CardContent>
    </Card>
  );
}
