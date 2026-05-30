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
import { UpgradePrompt } from "@/components/upgrade-prompt/UpgradePrompt";
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
  const hasAccess = PLAN_FEATURES[usage.plan].recurringInvoices;

  if (!hasAccess) {
    return (
      <UpgradePrompt
        title="Recurring Invoices"
        description="Automate your billing with recurring invoice templates."
        message={
          <>
            Recurring invoices are available on the <strong>Starter</strong> plan and
            above. Upgrade to automate your billing cycles.
          </>
        }
      />
    );
  }

  const [clients, recurringInvoices] = await Promise.all([
    prisma.client.findMany({ where: { userId: session.user.id } }),
    prisma.recurringInvoice.findMany({
      where: { userId: session.user.id },
      include: { client: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <RefreshCw className="size-5" /> Recurring Invoices
            </CardTitle>
            <CardDescription>
              Invoice templates that generate automatically on a schedule.
            </CardDescription>
          </div>
          <div className="shrink-0">
            <RecurringInvoiceDialog
              clients={clients}
              trigger={
                <Button>
                  <PlusIcon className="mr-2 size-4" /> New Recurring Invoice
                </Button>
              }
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <RecurringInvoiceList items={recurringInvoices} />
      </CardContent>
    </Card>
  );
}
