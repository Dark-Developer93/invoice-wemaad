"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ColoredButton from "../ui/ColoredButton";
import { cn } from "@/lib/utils";

export interface MarketingPlanData {
  plan: string;
  title: string;
  price: number | null; // monthly; null = custom pricing
  description: string;
  popular: boolean;
  invoiceLimit: number | null;
  emailLimit: number | null;
  clientLimit: number | null;
  recurringInvoices: boolean;
  analyticsLevel: "NONE" | "BASIC" | "ADVANCED";
  brandingLevel: "SHOWN" | "MINIMAL" | "HIDDEN";
  teamCollaboration: boolean;
  apiAccessLevel: "NONE" | "BASIC" | "ADVANCED";
  multiUser: boolean;
  customIntegrations: boolean;
  supportLevel: "STANDARD" | "PRIORITY" | "DEDICATED";
  slaGuarantee: boolean;
}

const ANALYTICS_LABEL: Record<MarketingPlanData["analyticsLevel"], string> = {
  NONE: "—",
  BASIC: "Basic",
  ADVANCED: "Advanced",
};

const BRANDING_LABEL: Record<MarketingPlanData["brandingLevel"], string> = {
  SHOWN: "Shown",
  MINIMAL: "Minimal",
  HIDDEN: "Removed",
};

const API_ACCESS_LABEL: Record<MarketingPlanData["apiAccessLevel"], string> = {
  NONE: "—",
  BASIC: "Basic",
  ADVANCED: "Advanced",
};

const SUPPORT_LABEL: Record<MarketingPlanData["supportLevel"], string> = {
  STANDARD: "Standard",
  PRIORITY: "Priority",
  DEDICATED: "Dedicated",
};

// Ascending order for diffing a plan's tier against the one below it —
// each array's index doubles as its "how much better" rank.
const ANALYTICS_ORDER: MarketingPlanData["analyticsLevel"][] = ["NONE", "BASIC", "ADVANCED"];
const BRANDING_ORDER: MarketingPlanData["brandingLevel"][] = ["SHOWN", "MINIMAL", "HIDDEN"];
const API_ACCESS_ORDER: MarketingPlanData["apiAccessLevel"][] = ["NONE", "BASIC", "ADVANCED"];
const SUPPORT_ORDER: MarketingPlanData["supportLevel"][] = ["STANDARD", "PRIORITY", "DEDICATED"];

// Only the features a plan adds on top of the one directly below it in
// PLAN_ORDER, in short/scannable form — the full explanation (e.g. what
// "Minimal branding" means) lives in the Compare Plans table below, not
// repeated on every card. The lowest plan (no `previous`) gets nothing
// here, since it has nothing to diff against and no "Everything in..."
// line to lead with.
function getDynamicFeatures(
  plan: MarketingPlanData,
  previous: MarketingPlanData | undefined
): string[] {
  const features: string[] = [];

  if (plan.recurringInvoices && !previous?.recurringInvoices) {
    features.push("Recurring invoices");
  }

  const analyticsRank = ANALYTICS_ORDER.indexOf(plan.analyticsLevel);
  const prevAnalyticsRank = previous ? ANALYTICS_ORDER.indexOf(previous.analyticsLevel) : -1;
  if (analyticsRank > prevAnalyticsRank) {
    if (plan.analyticsLevel === "BASIC") features.push("Basic reports");
    if (plan.analyticsLevel === "ADVANCED") features.push("Advanced reports");
  }

  const brandingRank = BRANDING_ORDER.indexOf(plan.brandingLevel);
  const prevBrandingRank = previous ? BRANDING_ORDER.indexOf(previous.brandingLevel) : -1;
  if (brandingRank > prevBrandingRank) {
    if (plan.brandingLevel === "MINIMAL") features.push("Minimal branding");
    if (plan.brandingLevel === "HIDDEN") features.push("Fully white-labeled");
  }

  const apiRank = API_ACCESS_ORDER.indexOf(plan.apiAccessLevel);
  const prevApiRank = previous ? API_ACCESS_ORDER.indexOf(previous.apiAccessLevel) : -1;
  if (apiRank > prevApiRank) {
    if (plan.apiAccessLevel === "BASIC") features.push("Basic API access");
    if (plan.apiAccessLevel === "ADVANCED") features.push("Advanced API access");
  }

  if (plan.teamCollaboration && !previous?.teamCollaboration) features.push("Team collaboration");
  if (plan.multiUser && !previous?.multiUser) features.push("Multi-user access");

  const supportRank = SUPPORT_ORDER.indexOf(plan.supportLevel);
  const prevSupportRank = previous ? SUPPORT_ORDER.indexOf(previous.supportLevel) : -1;
  if (supportRank > prevSupportRank) {
    if (plan.supportLevel === "PRIORITY") features.push("Priority support");
    if (plan.supportLevel === "DEDICATED") features.push("Dedicated support");
  }

  if (plan.customIntegrations && !previous?.customIntegrations) features.push("Custom integrations");
  if (plan.slaGuarantee && !previous?.slaGuarantee) features.push("SLA guarantee");

  return features;
}

// Rows that don't vary by plan — included with every tier, so they don't
// need a PlanConfig field of their own. Shown on every plan's Compare
// Plans row, and on the lowest-tier card only (higher cards imply them
// via "Everything in [lower plan]" instead of repeating them).
const BASELINE_FEATURES = [
  "Client management",
  "PDF generation & secure sharing",
  "Automated invoice emails",
  "Basic invoice templates",
];

interface CompareRow {
  label: string;
  value: (plan: MarketingPlanData) => string | boolean;
}

const COMPARE_ROWS: CompareRow[] = [
  { label: "Monthly invoices", value: (p) => p.invoiceLimit?.toString() ?? "Unlimited" },
  { label: "Monthly emails", value: (p) => p.emailLimit?.toString() ?? "Unlimited" },
  { label: "Clients", value: (p) => p.clientLimit?.toString() ?? "Unlimited" },
  ...BASELINE_FEATURES.map((label): CompareRow => ({ label, value: () => true })),
  { label: "Recurring invoices", value: (p) => p.recurringInvoices },
  { label: "Reports & analytics", value: (p) => ANALYTICS_LABEL[p.analyticsLevel] },
  { label: "Our branding on your invoices", value: (p) => BRANDING_LABEL[p.brandingLevel] },
  { label: "Team collaboration", value: (p) => p.teamCollaboration },
  { label: "API access", value: (p) => API_ACCESS_LABEL[p.apiAccessLevel] },
  { label: "Multi-user access", value: (p) => p.multiUser },
  { label: "Support", value: (p) => SUPPORT_LABEL[p.supportLevel] },
  { label: "Custom integrations", value: (p) => p.customIntegrations },
  { label: "SLA guarantee", value: (p) => p.slaGuarantee },
];

const PricingSection = ({
  plans,
  isAuthenticated,
}: {
  plans: MarketingPlanData[];
  isAuthenticated: boolean;
}) => {
  const [isYearly, setIsYearly] = useState(false);

  const getButtonConfig = (plan: MarketingPlanData) => {
    if (plan.price === null) {
      return {
        text: "Contact Sales",
        href: "mailto:sales@invoicewemaad.com",
      };
    }
    return {
      text: isAuthenticated ? "Upgrade Plan" : "Get Started",
      href: isAuthenticated ? "/dashboard/billing" : "/login",
    };
  };

  return (
    <section
      id="pricing"
      className="relative flex flex-col items-center justify-center py-12 md:py-24 px-4 md:px-6"
    >
      <div className="text-center mb-8 md:mb-12">
        <span className="inline-block text-sm text-primary font-medium tracking-tight bg-primary/10 px-4 py-2 rounded-full">
          Simple Pricing
        </span>
        <h2 className="mt-6 md:mt-8 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Choose your plan
        </h2>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-[90vw] md:max-w-2xl mx-auto">
          Start with our free tier and upgrade as you grow. All plans include
          14-day free trial.
        </p>
      </div>

      <Tabs
        defaultValue="0"
        className="w-40 mx-auto"
        onValueChange={(value) => setIsYearly(value === "1")}
      >
        <TabsList className="grid w-full grid-cols-2 h-11">
          <TabsTrigger value="0" className="text-sm md:text-base">
            Monthly
          </TabsTrigger>
          <TabsTrigger value="1" className="text-sm md:text-base">
            Yearly
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mt-8 w-full max-w-7xl mx-auto">
        {plans.map((plan, index) => {
          const isExclusive = plan.price === null;
          // 2 months free on the annual plan (10x monthly instead of 12x).
          const yearlyPrice = plan.price !== null ? plan.price * 10 : null;
          const savings =
            plan.price !== null && plan.price > 0 ? plan.price * 12 - (yearlyPrice ?? 0) : 0;
          const previousPlan = plans[index - 1];
          // Computed, not typed in anywhere — always accurate and always
          // leads the list, so the card reads "Everything in X, plus:
          // [what's new]" instead of burying that line at the end.
          const everythingInLine = previousPlan ? `Everything in ${previousPlan.title}` : null;
          // Derived straight from the same live PlanConfig fields the
          // Compare Plans table reads, so a toggle in /admin/plans can
          // never update one surface without the other — there is no
          // free-text feature field left to drift out of sync. Only
          // what's new versus the plan below — see getDynamicFeatures.
          const dynamicFeatures = getDynamicFeatures(plan, previousPlan);

          const cardFeatures = [
            `${plan.invoiceLimit ?? "Unlimited"} invoices & ${plan.emailLimit ?? "unlimited"} emails / month`,
            `${plan.clientLimit ?? "Unlimited"} clients`,
            // The lowest plan has no "Everything in..." line to lean on,
            // so it lists the always-included baseline features directly.
            ...(everythingInLine ? [everythingInLine] : BASELINE_FEATURES),
            ...dynamicFeatures,
          ];

          return (
            <Card
              key={plan.plan}
              className={cn(
                "relative flex flex-col justify-between transition-all hover:scale-105 w-full max-w-sm mx-auto",
                {
                  "border-primary/50 shadow-xl shadow-primary/10": plan.popular,
                  "rounded-lg border text-card-foreground shadow-sm py-1 border-primary/20 dark:border-zinc-700 animate-background-shine bg-white dark:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%]":
                    isExclusive,
                }
              )}
            >
              <div>
                <CardHeader className="pb-8 pt-4">
                  {isYearly && savings > 0 ? (
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{plan.title}</CardTitle>
                      <div
                        className={cn("px-2.5 rounded-xl h-fit text-sm py-1 bg-muted", {
                          "bg-gradient-to-r from-orange-400 to-rose-400 text-primary-foreground":
                            plan.popular,
                        })}
                      >
                        Save ${savings}
                      </div>
                    </div>
                  ) : (
                    <CardTitle className="text-lg">{plan.title}</CardTitle>
                  )}
                  <div className="flex gap-0.5 mt-4">
                    <h3 className="text-4xl font-bold">
                      {plan.price !== null ? `$${isYearly ? yearlyPrice : plan.price}` : "Custom"}
                    </h3>
                    <span className="flex flex-col justify-end text-sm mb-1">
                      {plan.price !== null && `/${isYearly ? "year" : "month"}`}
                    </span>
                  </div>
                  <CardDescription className="pt-1.5 h-12">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-3">
                  {cardFeatures.map((feature) => (
                    <div key={feature} className="flex gap-2">
                      <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
                      <p className="text-sm text-muted-foreground">{feature}</p>
                    </div>
                  ))}
                </CardContent>
              </div>

              <CardFooter className="mt-2">
                <Link href={getButtonConfig(plan).href} className="w-full">
                  <ColoredButton className="relative inline-flex w-full items-center justify-center rounded-md bg-primary text-primary-foreground px-6 font-medium transition-colors">
                    {getButtonConfig(plan).text}
                  </ColoredButton>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-16 md:mt-24 w-full max-w-6xl mx-auto">
        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle>Compare Plans</CardTitle>
            <CardDescription>See which plan is right for you</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-center text-muted-foreground mb-3 sm:hidden">
              ← Scroll to compare all plans →
            </p>
            <table className="w-full min-w-[600px] table-fixed">
              <colgroup>
                <col className="w-[220px]" />
                {plans.map((plan) => (
                  <col key={plan.plan} />
                ))}
              </colgroup>
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left" />
                  {plans.map((plan) => (
                    <th key={plan.plan} className="pb-3 text-center text-sm font-semibold">
                      {plan.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td className="py-4 text-sm font-medium">{row.label}</td>
                    {plans.map((plan) => {
                      const value = row.value(plan);
                      return (
                        <td key={`${plan.plan}-${row.label}`} className="py-4 text-center">
                          {typeof value === "boolean" ? (
                            value ? (
                              <CheckCircle2 size={18} className="text-emerald-500 mx-auto" />
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )
                          ) : (
                            <span className="text-sm">{value}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PricingSection;
