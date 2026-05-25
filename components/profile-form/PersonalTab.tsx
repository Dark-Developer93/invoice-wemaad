"use client";

import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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

interface PersonalTabProps {
  form: UseFormReturn<ProfileFormValues>;
  email: string;
}

export function PersonalTab({ form, email }: PersonalTabProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 mt-4">
          <div className="grid gap-2">
            <FormLabel>Email</FormLabel>
            <Input value={email} disabled className="bg-muted" />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Street Name" {...field} />
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
