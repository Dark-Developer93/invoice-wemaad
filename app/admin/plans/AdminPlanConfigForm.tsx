"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminUpdatePlanConfig, type PlanConfigInput } from "@/app/actions/admin";
import type { PlanConfigData, PlanType } from "@/lib/plans";

const FEATURE_FIELDS: Array<{ key: keyof PlanConfigInput & string; label: string }> = [
  { key: "recurringInvoices", label: "Recurring invoices" },
  { key: "teamCollaboration", label: "Team collaboration" },
  { key: "multiUser", label: "Multi-user access" },
];

const ANALYTICS_LEVEL_OPTIONS: Array<{ value: PlanConfigInput["analyticsLevel"]; label: string }> = [
  { value: "NONE", label: "No access" },
  { value: "BASIC", label: "Basic — totals only" },
  { value: "ADVANCED", label: "Advanced — charts + export" },
];

const BRANDING_LEVEL_OPTIONS: Array<{ value: PlanConfigInput["brandingLevel"]; label: string }> = [
  { value: "SHOWN", label: "Shown — full CTA + link" },
  { value: "MINIMAL", label: "Minimal — small credit, no link" },
  { value: "HIDDEN", label: "Hidden — fully white-labeled" },
];

const API_ACCESS_LEVEL_OPTIONS: Array<{ value: PlanConfigInput["apiAccessLevel"]; label: string }> = [
  { value: "NONE", label: "No access" },
  { value: "BASIC", label: "Basic" },
  { value: "ADVANCED", label: "Advanced" },
];

function toFormState(config: PlanConfigData) {
  return {
    price: config.price === null ? "" : String(config.price),
    invoiceLimit: config.invoiceLimit === null ? "" : String(config.invoiceLimit),
    emailLimit: config.emailLimit === null ? "" : String(config.emailLimit),
    clientLimit: config.clientLimit === null ? "" : String(config.clientLimit),
    recurringInvoices: config.recurringInvoices,
    analyticsLevel: config.analyticsLevel,
    brandingLevel: config.brandingLevel,
    teamCollaboration: config.teamCollaboration,
    apiAccessLevel: config.apiAccessLevel,
    multiUser: config.multiUser,
    description: config.description,
    extraFeatures: config.extraFeatures.join("\n"),
    popular: config.popular,
  };
}

export function AdminPlanConfigForm({
  plan,
  name,
  config,
}: {
  plan: PlanType;
  name: string;
  config: PlanConfigData;
}) {
  const [form, setForm] = useState(toFormState(config));
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    const price = form.price.trim() === "" ? null : Number(form.price);
    const invoiceLimit = form.invoiceLimit.trim() === "" ? null : Number(form.invoiceLimit);
    const emailLimit = form.emailLimit.trim() === "" ? null : Number(form.emailLimit);
    const clientLimit = form.clientLimit.trim() === "" ? null : Number(form.clientLimit);
    const extraFeatures = form.extraFeatures
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (price !== null && (Number.isNaN(price) || price < 0)) {
      toast.error("Price must be a non-negative number, or blank for custom pricing.");
      return;
    }
    if (invoiceLimit !== null && (Number.isNaN(invoiceLimit) || invoiceLimit < 1)) {
      toast.error("Invoice limit must be a positive number, or blank for unlimited.");
      return;
    }
    if (emailLimit !== null && (Number.isNaN(emailLimit) || emailLimit < 1)) {
      toast.error("Email limit must be a positive number, or blank for unlimited.");
      return;
    }
    if (clientLimit !== null && (Number.isNaN(clientLimit) || clientLimit < 1)) {
      toast.error("Client limit must be a positive number, or blank for unlimited.");
      return;
    }

    startTransition(async () => {
      try {
        await adminUpdatePlanConfig(plan, {
          price,
          invoiceLimit,
          emailLimit,
          clientLimit,
          recurringInvoices: form.recurringInvoices,
          analyticsLevel: form.analyticsLevel,
          brandingLevel: form.brandingLevel,
          teamCollaboration: form.teamCollaboration,
          apiAccessLevel: form.apiAccessLevel,
          multiUser: form.multiUser,
          description: form.description,
          extraFeatures,
          popular: form.popular,
        });
        toast.success(`${name} plan updated.`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update plan.";
        toast.error(message);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{name}</CardTitle>
        <CardDescription>Leave price/limits blank for custom pricing or unlimited.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`${plan}-price`}>Price ($/mo)</Label>
            <Input
              id={`${plan}-price`}
              type="number"
              min={0}
              placeholder="Custom"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${plan}-invoices`}>Invoices/mo</Label>
            <Input
              id={`${plan}-invoices`}
              type="number"
              min={1}
              placeholder="Unlimited"
              value={form.invoiceLimit}
              onChange={(e) => setForm((f) => ({ ...f, invoiceLimit: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${plan}-emails`}>Emails/mo</Label>
            <Input
              id={`${plan}-emails`}
              type="number"
              min={1}
              placeholder="Unlimited"
              value={form.emailLimit}
              onChange={(e) => setForm((f) => ({ ...f, emailLimit: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${plan}-clients`}>Clients (total)</Label>
            <Input
              id={`${plan}-clients`}
              type="number"
              min={1}
              placeholder="Unlimited"
              value={form.clientLimit}
              onChange={(e) => setForm((f) => ({ ...f, clientLimit: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`${plan}-analytics`}>Reports & analytics</Label>
            <Select
              value={form.analyticsLevel}
              onValueChange={(value) =>
                setForm((f) => ({ ...f, analyticsLevel: value as typeof f.analyticsLevel }))
              }
            >
              <SelectTrigger id={`${plan}-analytics`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANALYTICS_LEVEL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${plan}-branding`}>Invoice branding</Label>
            <Select
              value={form.brandingLevel}
              onValueChange={(value) =>
                setForm((f) => ({ ...f, brandingLevel: value as typeof f.brandingLevel }))
              }
            >
              <SelectTrigger id={`${plan}-branding`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BRANDING_LEVEL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${plan}-api`}>API access</Label>
            <Select
              value={form.apiAccessLevel}
              onValueChange={(value) =>
                setForm((f) => ({ ...f, apiAccessLevel: value as typeof f.apiAccessLevel }))
              }
            >
              <SelectTrigger id={`${plan}-api`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {API_ACCESS_LEVEL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2.5">
          {FEATURE_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={`${plan}-${key}`} className="font-normal cursor-pointer">
                {label}
              </Label>
              <Switch
                id={`${plan}-${key}`}
                checked={form[key] as boolean}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, [key]: checked }))}
              />
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground">
            Public marketing page (homepage pricing section)
          </p>

          <div className="space-y-1.5">
            <Label htmlFor={`${plan}-description`}>Tagline</Label>
            <Input
              id={`${plan}-description`}
              placeholder="Short description shown under the plan name"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${plan}-features`}>Additional features (one per line)</Label>
            <Textarea
              id={`${plan}-features`}
              rows={5}
              placeholder={"Client management\nPriority support\n..."}
              value={form.extraFeatures}
              onChange={(e) => setForm((f) => ({ ...f, extraFeatures: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Shown below the invoice/email limits and the toggles above,
              which are always listed automatically.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor={`${plan}-popular`} className="font-normal cursor-pointer">
              &quot;Most Popular&quot; badge
            </Label>
            <Switch
              id={`${plan}-popular`}
              checked={form.popular}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, popular: checked }))}
            />
          </div>
        </div>

        <Button
          id={`${plan}-save`}
          onClick={handleSave}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
