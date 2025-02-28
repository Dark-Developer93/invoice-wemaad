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
  title: "Invoices | WeMaAd Invoice",
  description: "View your invoice invoices",
};

export default async function InvoicesRoute() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, clients] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstName: true,
        lastName: true,
        address: true,
        email: true,
        companyName: true,
        companyEmail: true,
        companyAddress: true,
      },
    }),
    prisma.client.findMany({
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
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
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
            firstName={user.firstName ?? ""}
            lastName={user.lastName ?? ""}
            address={user.address ?? ""}
            email={user.email ?? ""}
            companyName={user.companyName ?? ""}
            companyEmail={user.companyEmail ?? ""}
            companyAddress={user.companyAddress ?? ""}
            clients={clients}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<InvoiceListSkeleton />}>
          <InvoiceList />
        </Suspense>
      </CardContent>
    </Card>
  );
}
