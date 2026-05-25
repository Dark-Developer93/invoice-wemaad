"use client";

import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { clientFormSchema } from "@/lib/zodSchemas";

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ContactPersonsTabProps {
  form: UseFormReturn<ClientFormValues>;
}

export function ContactPersonsTab({ form }: ContactPersonsTabProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        {form.watch("contactPersons")?.map((_, index) => (
          <div
            key={index}
            className="grid gap-4 md:grid-cols-2 mb-8 pb-8 border-b last:mb-0 last:pb-0 last:border-0"
          >
            <FormField
              control={form.control}
              name={`contactPersons.${index}.firstName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`contactPersons.${index}.lastName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`contactPersons.${index}.email`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contact@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`contactPersons.${index}.phone`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`contactPersons.${index}.position`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input placeholder="Job position" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-1 sm:col-span-2 flex justify-end">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  const contacts = form.getValues("contactPersons");
                  form.setValue(
                    "contactPersons",
                    contacts.filter((_, i) => i !== index)
                  );
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Contact
              </Button>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => {
            const contacts = form.getValues("contactPersons");
            form.setValue("contactPersons", [
              ...contacts,
              {
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                position: "",
                isPrimary: !contacts.length,
              },
            ]);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Contact Person
        </Button>
      </CardContent>
    </Card>
  );
}
