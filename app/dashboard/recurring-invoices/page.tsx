import { Suspense } from "react";
import { PlusIcon, RefreshCw } from "lucide-react";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { cacheTags } from "@/lib/cache";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RecurringInvoiceDialog } from "@/components/recurring-invoice-dialog/RecurringInvoiceDialog";
import { RecurringInvoiceList } from "@/components/recurring-invoice-list/RecurringInvoiceList";
import { UpgradePrompt } from "@/components/upgrade-prompt/UpgradePrompt";
import { getUserUsage } from "@/lib/usage";
import { PLAN_FEATURES } from "@/lib/plans";

export const metadata = {
  title: "Recurring Invoices",
  description: "Create and manage automated recurring invoices sent on a schedule.",
  robots: { index: false, follow: false },
};

// Cached until invalidated by revalidateTag(cacheTags.recurringInvoices(userId))
// in every recurring-invoice-mutating action (including the daily cron) — no
// time-based staleness.
function getRecurringInvoices(userId: string) {
  return unstable_cache(
    () =>
      prisma.recurringInvoice.findMany({
        where: { userId },
        include: { client: true },
        orderBy: { createdAt: "desc" },
      }),
    ["recurring-invoices-list", userId],
    { tags: [cacheTags.recurringInvoices(userId)] }
  )();
}

async function RecurringInvoiceListContent({ userId }: { userId: string }) {
  const recurringInvoices = await getRecurringInvoices(userId);

  return <RecurringInvoiceList items={recurringInvoices} />;
}

function RecurringInvoiceListSkeleton() {
  return (
    <>
      <div className="md:hidden space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-7 border-b px-4 py-3 gap-4">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-10" />
          </div>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-7 items-center px-4 py-3 border-b last:border-0 gap-4"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-8 w-8 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default async function RecurringInvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [usage, clients] = await Promise.all([
    getUserUsage(session.user.id),
    unstable_cache(
      () => prisma.client.findMany({ where: { userId: session.user!.id } }),
      ["clients-for-recurring-picker", session.user.id],
      { tags: [cacheTags.clients(session.user.id)] }
    )(),
  ]);

  if (!PLAN_FEATURES[usage.plan].recurringInvoices) {
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
        <Suspense fallback={<RecurringInvoiceListSkeleton />}>
          <RecurringInvoiceListContent userId={session.user.id} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
