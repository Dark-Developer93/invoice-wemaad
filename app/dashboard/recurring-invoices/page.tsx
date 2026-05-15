import { PlusIcon, RefreshCw } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecurringInvoiceDialog } from "@/components/recurring-invoice-dialog/RecurringInvoiceDialog";
import { RecurringInvoiceList } from "@/components/recurring-invoice-list/RecurringInvoiceList";
import { getUserUsage } from "@/lib/usage";
import { PLAN_FEATURES } from "@/lib/plans";

export const metadata = {
  title: "Recurring Invoices | WeMaAd Invoice",
  description: "Manage your recurring invoices",
};

export default async function RecurringInvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const usage = await getUserUsage(session.user.id);
  const hasAccess = PLAN_FEATURES[usage.plan].analytics;

  if (!hasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="size-5" /> Recurring Invoices
          </CardTitle>
          <CardDescription>
            Automate your billing with recurring invoice templates.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-muted-foreground max-w-sm">
            Recurring invoices are available on the <strong>Starter</strong> plan and
            above. Upgrade to automate your billing cycles.
          </p>
          <Button asChild>
            <a href="/dashboard/billing">Upgrade Plan</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const [user, clients, recurringInvoices] = await Promise.all([
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
    prisma.client.findMany({ where: { userId: session.user.id } }),
    prisma.recurringInvoice.findMany({
      where: { userId: session.user.id },
      include: { client: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) redirect("/login");

  const fromName =
    user.companyName || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  const fromEmail = user.companyEmail || user.email || "";
  const fromAddress = user.companyAddress || user.address || "";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <RefreshCw className="size-5" /> Recurring Invoices
            </CardTitle>
            <CardDescription>
              Invoice templates that generate automatically on a schedule.
            </CardDescription>
          </div>
          <RecurringInvoiceDialog
            clients={clients}
            defaultFromName={fromName}
            defaultFromEmail={fromEmail}
            defaultFromAddress={fromAddress}
            trigger={
              <Button>
                <PlusIcon className="mr-2 size-4" /> New Recurring Invoice
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent>
        <RecurringInvoiceList items={recurringInvoices} />
      </CardContent>
    </Card>
  );
}
