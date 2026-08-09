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
import { type MarketingPlanData, getCardFeatures, COMPARE_ROWS } from "./pricingFeatures";

export type { MarketingPlanData };

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
          // Same function pricingFeatures.test.ts asserts against — the
          // card and the Compare Plans table below both read off
          // pricingFeatures.ts, so a toggle in /admin/plans can never
          // update one surface without the other.
          const cardFeatures = getCardFeatures(plan, previousPlan);

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
