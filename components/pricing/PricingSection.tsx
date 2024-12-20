"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    title: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for trying out our service",
    features: ["1 user", "Basic support", "1GB storage", "Basic analytics"],
  },
  {
    title: "Pro",
    monthlyPrice: 15,
    yearlyPrice: 150,
    description: "Ideal for professionals and growing teams",
    features: [
      "5 users",
      "Priority support",
      "10GB storage",
      "Advanced analytics",
      "Custom domains",
      "Team collaboration",
    ],
    popular: true,
  },
  {
    title: "Enterprise",
    description: "For large-scale organizations",
    features: [
      "Unlimited users",
      "24/7 support",
      "Unlimited storage",
      "Advanced analytics",
      "Custom domains",
      "Team collaboration",
      "Custom integrations",
      "SLA",
    ],
    exclusive: true,
  },
];

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);
  const togglePricingPeriod = (value: string) =>
    setIsYearly(parseInt(value) === 1);

  return (
    <section className="relative flex flex-col items-center justify-center py-24">
      <div className="text-center mb-12">
        <span className="text-sm text-primary font-medium tracking-tight bg-primary/10 px-4 py-2 rounded-full">
          Simple Pricing
        </span>
        <h2 className="mt-8 text-4xl sm:text-5xl font-bold tracking-tight">
          Choose your plan
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Start with our free tier and upgrade as you grow. All plans include
          14-day free trial.
        </p>
      </div>

      <Tabs
        defaultValue="0"
        className="w-40 mx-auto"
        onValueChange={togglePricingPeriod}
      >
        <TabsList className="grid w-full grid-cols-2 h-11">
          <TabsTrigger value="0" className="text-base">
            Monthly
          </TabsTrigger>
          <TabsTrigger value="1" className="text-base">
            Yearly
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid md:grid-cols-3 gap-8 mt-8 max-w-6xl mx-auto px-4">
        {plans.map((plan) => (
          <Card
            key={plan.title}
            className={cn(
              "relative flex flex-col justify-between transition-all hover:scale-105",
              {
                "border-primary/50 shadow-xl shadow-primary/10": plan.popular,
                "rounded-lg border text-card-foreground shadow-sm w-72 flex flex-col justify-between py-1 border-zinc-700 mx-auto sm:mx-0 animate-background-shine bg-white dark:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] transition-colors":
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
              <Button className="relative inline-flex w-full items-center justify-center rounded-md bg-primary text-primary-foreground px-6 font-medium transition-colors">
                <div className="absolute -inset-0.5 -z-10 rounded-lg bg-gradient-to-b from-[#c7d2fe] to-[#8678f9] opacity-75 blur" />
                {plan.exclusive ? "Contact Sales" : "Get Started"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Comparison table with updated styling to match DashboardBlocks */}
      <div className="mt-24 max-w-6xl mx-auto px-4 w-full">
        <Card>
          <CardHeader>
            <CardTitle>Compare Plans</CardTitle>
            <CardDescription>See which plan is right for you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {[
                "Users",
                "Storage",
                "Support",
                "Analytics",
                "Custom domains",
                "Team collaboration",
                "Custom integrations",
                "SLA",
              ].map((feature) => (
                <div
                  key={feature}
                  className="grid grid-cols-4 items-center gap-4"
                >
                  <span className="text-sm font-medium">{feature}</span>
                  {plans.map((plan) => (
                    <div
                      key={`${plan.title}-${feature}`}
                      className="flex justify-center"
                    >
                      {plan.features.includes(feature) ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PricingSection;
