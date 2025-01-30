"use client";

import { JSX, useState } from "react";
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

const plans = [
  {
    title: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for freelancers just starting out",
    features: [
      "5 invoices per month",
      "20 emails per month",
      "Basic invoice management",
      "Email support",
      "Basic invoice templates",
    ],
  },
  {
    title: "Starter",
    monthlyPrice: 9,
    yearlyPrice: 90,
    description: "Great for growing businesses",
    features: [
      "25 invoices per month",
      "50 emails per month",
      "Full invoice management",
      "Priority email support",
      "Custom invoice templates",
      "Basic analytics",
    ],
  },
  {
    title: "Pro",
    monthlyPrice: 29,
    yearlyPrice: 290,
    description: "For established businesses",
    features: [
      "100 invoices per month",
      "500 emails per month",
      "Full invoice management",
      "Priority support",
      "Custom invoice templates",
      "Advanced analytics",
      "Basic API access",
      "Custom branding",
      "Team collaboration",
    ],
    popular: true,
  },
  {
    title: "Business",
    description: "For large organizations",
    features: [
      "Unlimited invoices",
      "Unlimited emails",
      "Full invoice management",
      "Dedicated support",
      "Custom invoice templates",
      "Advanced analytics",
      "Advanced API access",
      "Full custom branding",
      "Team collaboration",
      "Multi-user access",
      "Custom integrations",
      "SLA guarantee",
    ],
    exclusive: true,
  },
];

const PricingSection = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const [isYearly, setIsYearly] = useState(false);

  const getFeatureValue = (plan: (typeof plans)[0], feature: string) => {
    switch (feature) {
      case "Monthly invoices":
        if (plan.title === "Free") return "5";
        if (plan.title === "Starter") return "25";
        if (plan.title === "Pro") return "100";
        return "Unlimited";
      case "Monthly emails":
        if (plan.title === "Free") return "20";
        if (plan.title === "Starter") return "50";
        if (plan.title === "Pro") return "500";
        return "Unlimited";
      default:
        const featureMap: Record<string, string | JSX.Element> = {
          "Invoice management":
            plan.features
              .find((f) => f.includes("invoice management"))
              ?.split(" ")[0] || "—",
          "Email support":
            plan.features.find((f) => f.includes("support"))?.split(" ")[0] ||
            "—",
          "Invoice templates": plan.features.find((f) =>
            f.includes("template")
          ) ? (
            <CheckCircle2 size={18} className="text-emerald-500 mx-auto" />
          ) : (
            "—"
          ),
          Analytics: plan.features.find((f) => f.includes("analytics")) ? (
            <CheckCircle2 size={18} className="text-emerald-500 mx-auto" />
          ) : (
            "—"
          ),
          "API access": plan.features.find((f) => f.includes("API")) ? (
            <CheckCircle2 size={18} className="text-emerald-500 mx-auto" />
          ) : (
            "—"
          ),
          "Custom branding": plan.features.find((f) =>
            f.includes("branding")
          ) ? (
            <CheckCircle2 size={18} className="text-emerald-500 mx-auto" />
          ) : (
            "—"
          ),
          "Team collaboration": plan.features.find((f) =>
            f.includes("collaboration")
          ) ? (
            <CheckCircle2 size={18} className="text-emerald-500 mx-auto" />
          ) : (
            "—"
          ),
          "Multi-user access": plan.features.find((f) =>
            f.includes("Multi-user")
          ) ? (
            <CheckCircle2 size={18} className="text-emerald-500 mx-auto" />
          ) : (
            "—"
          ),
          "Custom integrations": plan.features.find((f) =>
            f.includes("integrations")
          ) ? (
            <CheckCircle2 size={18} className="text-emerald-500 mx-auto" />
          ) : (
            "—"
          ),
          "SLA guarantee": plan.features.find((f) => f.includes("SLA")) ? (
            <CheckCircle2 size={18} className="text-emerald-500 mx-auto" />
          ) : (
            "—"
          ),
        };
        return featureMap[feature] || "—";
    }
  };

  const getButtonConfig = (plan: (typeof plans)[0]) => {
    if (plan.exclusive) {
      return {
        text: "Contact Sales",
        href: isAuthenticated ? "/dashboard/billing" : "/login",
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
        {plans.map((plan) => (
          <Card
            key={plan.title}
            className={cn(
              "relative flex flex-col justify-between transition-all hover:scale-105 w-full max-w-sm mx-auto",
              {
                "border-primary/50 shadow-xl shadow-primary/10": plan.popular,
                "rounded-lg border text-card-foreground shadow-sm py-1 border-zinc-700 animate-background-shine bg-white dark:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%]":
                  plan.exclusive,
              }
            )}
          >
            <div>
              <CardHeader className="pb-8 pt-4">
                {isYearly && plan.yearlyPrice && plan.monthlyPrice ? (
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">{plan.title}</CardTitle>
                    <div
                      className={cn(
                        "px-2.5 rounded-xl h-fit text-sm py-1 bg-muted",
                        {
                          "bg-gradient-to-r from-orange-400 to-rose-400 text-primary-foreground":
                            plan.popular,
                        }
                      )}
                    >
                      Save ${plan.monthlyPrice * 12 - plan.yearlyPrice}
                    </div>
                  </div>
                ) : (
                  <CardTitle className="text-lg">{plan.title}</CardTitle>
                )}
                <div className="flex gap-0.5 mt-4">
                  <h3 className="text-4xl font-bold">
                    {plan.monthlyPrice !== undefined
                      ? `$${isYearly ? plan.yearlyPrice : plan.monthlyPrice}`
                      : "Custom"}
                  </h3>
                  <span className="flex flex-col justify-end text-sm mb-1">
                    {plan.monthlyPrice !== undefined &&
                      `/${isYearly ? "year" : "month"}`}
                  </span>
                </div>
                <CardDescription className="pt-1.5 h-12">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex gap-2">
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-emerald-500"
                    />
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
        ))}
      </div>

      <div className="mt-16 md:mt-24 w-full max-w-6xl mx-auto">
        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle>Compare Plans</CardTitle>
            <CardDescription>See which plan is right for you</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full min-w-[600px]">
              <tbody className="divide-y">
                {[
                  "Monthly invoices",
                  "Monthly emails",
                  "Invoice management",
                  "Email support",
                  "Invoice templates",
                  "Analytics",
                  "API access",
                  "Custom branding",
                  "Team collaboration",
                  "Multi-user access",
                  "Custom integrations",
                  "SLA guarantee",
                ].map((feature) => (
                  <tr key={feature}>
                    <td className="py-4 text-sm font-medium w-[200px]">
                      {feature}
                    </td>
                    {plans.map((plan) => (
                      <td
                        key={`${plan.title}-${feature}`}
                        className="py-4 text-center"
                      >
                        <span className="text-sm">
                          {getFeatureValue(plan, feature)}
                        </span>
                      </td>
                    ))}
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
