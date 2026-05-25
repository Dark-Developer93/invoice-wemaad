"use client";

import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { onboardingSchema } from "@/lib/zodSchemas";

type ProfileFormValues = z.infer<typeof onboardingSchema>;

interface CompanyTabProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function CompanyTab({ form }: CompanyTabProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your Company Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Email</FormLabel>
                <FormControl>
                  <Input placeholder="company@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Address</FormLabel>
                <FormControl>
                  <Input placeholder="Company Address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyTaxId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Tax ID</FormLabel>
                <FormControl>
                  <Input placeholder="Tax ID Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyLogoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Logo URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/logo.png" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stampsUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stamps URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/stamps.png" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
