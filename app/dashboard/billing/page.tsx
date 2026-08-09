import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Billing",
  description: "Manage your subscription plan, usage limits, and billing details.",
  robots: { index: false, follow: false },
};
import { format } from "date-fns";

import { requireUser } from "@/lib/session";
import { getUserUsage } from "@/lib/usage";
import { PLAN_NAMES, PlanType, PLAN_ORDER } from "@/lib/plans";
import { getPlanConfigs } from "@/lib/planConfig";
import { requestPlanUpgrade, getUserPendingUpgradeRequest } from "@/app/actions/billing";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import prisma from "@/lib/db";

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}) {
  const pct =
    limit === null ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const nearLimit = limit !== null && pct >= 80;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {used} / {limit ?? "∞"}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        {limit !== null && (
          <div
            className={cn(
              "h-full rounded-full transition-all",
              nearLimit ? "bg-destructive" : "bg-primary"
            )}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  );
}

async function BillingContent({ userId }: { userId: string }) {
  const [usage, userData, pendingRequest, planConfigs, clientsCount] = await Promise.all([
    getUserUsage(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, planUpdatedAt: true },
    }),
    getUserPendingUpgradeRequest(),
    getPlanConfigs(),
    prisma.client.count({ where: { userId } }),
  ]);

  if (!userData) notFound();

  const currentPlan = userData.plan as PlanType;
  const currentFeatures = planConfigs[currentPlan];

  const lockedFeatures: string[] = [];
  if (!currentFeatures.recurringInvoices) lockedFeatures.push("Recurring invoices");
  if (currentFeatures.analyticsLevel === "NONE") lockedFeatures.push("Analytics & reports");
  if (currentFeatures.analyticsLevel === "BASIC") lockedFeatures.push("Advanced analytics (charts + export)");
  if (currentFeatures.brandingLevel !== "HIDDEN") lockedFeatures.push("Fully white-labeled invoices");
  if (!currentFeatures.teamCollaboration) lockedFeatures.push("Team collaboration");
  if (currentFeatures.apiAccessLevel === "NONE") lockedFeatures.push("API access");
  if (currentFeatures.apiAccessLevel === "BASIC") lockedFeatures.push("Advanced API access");
  if (!currentFeatures.multiUser) lockedFeatures.push("Multi-user access");
  if (currentFeatures.supportLevel === "STANDARD") lockedFeatures.push("Priority support");
  if (currentFeatures.supportLevel === "PRIORITY") lockedFeatures.push("Dedicated support");
  if (!currentFeatures.customIntegrations) lockedFeatures.push("Custom integrations");
  if (!currentFeatures.slaGuarantee) lockedFeatures.push("SLA guarantee");

  return (
    <>
      {pendingRequest && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-4 flex items-start gap-3">
            <Clock className="size-5 text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">
                Upgrade request pending admin review
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                You requested the{" "}
                <span className="font-semibold">{PLAN_NAMES[pendingRequest.requestedPlan as PlanType]}</span>{" "}
                plan on {format(new Date(pendingRequest.createdAt), "MMM d, yyyy")}.
                The admin will review and activate your upgrade shortly.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <CardTitle>Current Plan</CardTitle>
            <Badge variant="secondary">{PLAN_NAMES[currentPlan]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {currentFeatures.price !== null
              ? currentFeatures.price === 0
                ? "Free forever"
                : `$${currentFeatures.price}/month`
              : "Custom pricing"}{" "}
            · Active since {format(new Date(userData.planUpdatedAt), "MMM d, yyyy")}
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <UsageBar
            label="Invoices this month"
            used={usage.invoicesThisMonth}
            limit={usage.invoiceLimit}
          />
          <UsageBar
            label="Emails this month"
            used={usage.emailsThisMonth}
            limit={usage.emailLimit}
          />
          <UsageBar
            label="Clients"
            used={clientsCount}
            limit={currentFeatures.clientLimit}
          />
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_ORDER.map((plan) => {
            const isCurrentPlan = plan === currentPlan;
            const isPendingPlan = pendingRequest?.requestedPlan === plan;
            const planConfig = planConfigs[plan];
            const price = planConfig.price;
            const isExclusive = plan === "BUSINESS";
            const isUpgrade = PLAN_ORDER.indexOf(plan) > PLAN_ORDER.indexOf(currentPlan);

            return (
              <Card
                key={plan}
                className={cn("flex flex-col", {
                  "border-primary shadow-md": isCurrentPlan,
                  "border-yellow-500/50": isPendingPlan && !isCurrentPlan,
                })}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <CardTitle className="text-base">{PLAN_NAMES[plan]}</CardTitle>
                    {isCurrentPlan && <Badge className="text-xs">Current</Badge>}
                    {isPendingPlan && !isCurrentPlan && (
                      <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                        Pending
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {price !== null ? (price === 0 ? "Free" : `$${price}`) : "Custom"}
                    {price !== null && price > 0 && (
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    )}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 text-sm text-muted-foreground space-y-1.5">
                  <p>{planConfig.invoiceLimit ?? "Unlimited"} invoices/mo</p>
                  <p>{planConfig.emailLimit ?? "Unlimited"} emails/mo</p>
                  <p>{planConfig.clientLimit ?? "Unlimited"} clients</p>
                  <p className="flex items-center gap-1">
                    {planConfig.recurringInvoices ? (
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="size-3.5 text-muted-foreground/50" />
                    )}
                    Recurring invoices
                  </p>
                  <p className="flex items-center gap-1">
                    {planConfig.analyticsLevel !== "NONE" ? (
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="size-3.5 text-muted-foreground/50" />
                    )}
                    {planConfig.analyticsLevel === "ADVANCED"
                      ? "Advanced analytics"
                      : planConfig.analyticsLevel === "BASIC"
                        ? "Basic reports"
                        : "Analytics & reports"}
                  </p>
                  <p className="flex items-center gap-1">
                    {planConfig.brandingLevel === "HIDDEN" ? (
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="size-3.5 text-muted-foreground/50" />
                    )}
                    {planConfig.brandingLevel === "MINIMAL"
                      ? "Minimal branding"
                      : "Fully white-labeled"}
                  </p>
                  <p className="flex items-center gap-1">
                    {planConfig.teamCollaboration ? (
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="size-3.5 text-muted-foreground/50" />
                    )}
                    Team collaboration
                  </p>
                </CardContent>
                <CardFooter>
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : isPendingPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      <Clock className="size-3.5 mr-1.5" />
                      Request Pending
                    </Button>
                  ) : isExclusive ? (
                    <a href="mailto:sales@invoicewemaad.com" className="w-full">
                      <Button variant="outline" className="w-full">
                        Contact Sales
                      </Button>
                    </a>
                  ) : (
                    <form
                      action={async () => {
                        "use server";
                        await requestPlanUpgrade(plan);
                      }}
                      className="w-full"
                    >
                      <Button
                        type="submit"
                        className="w-full"
                        variant={isUpgrade ? "default" : "outline"}
                      >
                        {isUpgrade ? "Request Upgrade" : "Request Downgrade"}
                      </Button>
                    </form>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {lockedFeatures.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Not included in your plan:</span>{" "}
              {lockedFeatures.join(", ")}. Request an upgrade to unlock these features.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function BillingContentSkeleton() {
  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
      <div>
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-16 mt-2" />
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                {[...Array(6)].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

export default async function BillingPage() {
  const session = await requireUser();

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Billing & Plan</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your subscription and monitor monthly usage.
        </p>
      </div>
      <Suspense fallback={<BillingContentSkeleton />}>
        <BillingContent userId={session.user!.id!} />
      </Suspense>
    </div>
  );
}
