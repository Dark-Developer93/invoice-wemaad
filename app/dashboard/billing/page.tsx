import { CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

import { requireUser } from "@/lib/session";
import { getUserUsage, UserUsage } from "@/lib/usage";
import { PLAN_FEATURES, PLAN_LIMITS, PLAN_PRICE, PlanType, PLAN_ORDER } from "@/lib/plans";
import { updateUserPlan } from "@/app/actions/billing";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const PLAN_NAMES: Record<PlanType, string> = {
  FREE: "Free",
  STARTER: "Starter",
  PRO: "Pro",
  BUSINESS: "Business",
};

export default async function BillingPage() {
  const session = await requireUser();
  const userId = session.user!.id!;

  const [usage, userData] = await Promise.all([
    getUserUsage(userId),
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { plan: true, planUpdatedAt: true },
    }),
  ]);

  const currentPlan = userData.plan as PlanType;
  const currentFeatures = PLAN_FEATURES[currentPlan];

  const lockedFeatures: string[] = [];
  if (!currentFeatures.analytics) lockedFeatures.push("Analytics");
  if (!currentFeatures.customBranding) lockedFeatures.push("Custom branding");
  if (!currentFeatures.teamCollaboration) lockedFeatures.push("Team collaboration");
  if (!currentFeatures.apiAccess) lockedFeatures.push("API access");
  if (!currentFeatures.multiUser) lockedFeatures.push("Multi-user access");

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Billing & Plan</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your subscription and monitor monthly usage.
        </p>
      </div>

      {/* Current plan + usage */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <CardTitle>Current Plan</CardTitle>
            <Badge variant="secondary">{PLAN_NAMES[currentPlan]}</Badge>
          </div>
          <CardDescription>
            {PLAN_PRICE[currentPlan] !== null
              ? PLAN_PRICE[currentPlan] === 0
                ? "Free forever"
                : `$${PLAN_PRICE[currentPlan]}/month`
              : "Custom pricing"}{" "}
            · Active since {format(new Date(userData.planUpdatedAt), "MMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
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
        </CardContent>
      </Card>

      {/* Plan selection */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_ORDER.map((plan) => {
            const isCurrentPlan = plan === currentPlan;
            const limits = PLAN_LIMITS[plan];
            const price = PLAN_PRICE[plan];
            const isExclusive = plan === "BUSINESS";

            return (
              <Card
                key={plan}
                className={cn("flex flex-col", {
                  "border-primary shadow-md": isCurrentPlan,
                })}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{PLAN_NAMES[plan]}</CardTitle>
                    {isCurrentPlan && (
                      <Badge className="text-xs">Current</Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {price !== null ? (price === 0 ? "Free" : `$${price}`) : "Custom"}
                    {price !== null && price > 0 && (
                      <span className="text-sm font-normal text-muted-foreground">
                        /mo
                      </span>
                    )}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 text-sm text-muted-foreground space-y-1.5">
                  <p>{limits.invoices ?? "Unlimited"} invoices/mo</p>
                  <p>{limits.emails ?? "Unlimited"} emails/mo</p>
                  <p className="flex items-center gap-1">
                    {PLAN_FEATURES[plan].analytics ? (
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="size-3.5 text-muted-foreground/50" />
                    )}
                    Analytics
                  </p>
                  <p className="flex items-center gap-1">
                    {PLAN_FEATURES[plan].customBranding ? (
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="size-3.5 text-muted-foreground/50" />
                    )}
                    Custom branding
                  </p>
                  <p className="flex items-center gap-1">
                    {PLAN_FEATURES[plan].teamCollaboration ? (
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
                  ) : isExclusive ? (
                    <a
                      href="mailto:sales@invoicewemaad.com"
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full">
                        Contact Sales
                      </Button>
                    </a>
                  ) : (
                    <form
                      action={async () => {
                        "use server";
                        await updateUserPlan(plan);
                      }}
                      className="w-full"
                    >
                      <Button
                        type="submit"
                        className="w-full"
                        variant={
                          PLAN_ORDER.indexOf(plan) >
                          PLAN_ORDER.indexOf(currentPlan)
                            ? "default"
                            : "outline"
                        }
                      >
                        {PLAN_ORDER.indexOf(plan) > PLAN_ORDER.indexOf(currentPlan)
                          ? "Upgrade"
                          : "Downgrade"}
                      </Button>
                    </form>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Locked features notice */}
      {lockedFeatures.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Not included in your plan:</span>{" "}
              {lockedFeatures.join(", ")}. Upgrade to unlock these features.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
