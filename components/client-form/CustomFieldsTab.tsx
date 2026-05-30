"use client";

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
import { useClientForm } from "./ClientFormContext";

export function CustomFieldsTab() {
  const { form } = useClientForm();
  return (
    <Card>
      <CardContent className="pt-6">
        {form.watch("customFields")?.map((_, index) => (
          <div
            key={index}
            className="grid gap-4 md:grid-cols-2 mb-8 pb-8 border-b last:mb-0 last:pb-0 last:border-0"
          >
            <FormField
              control={form.control}
              name={`customFields.${index}.key`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Field name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`customFields.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field Value</FormLabel>
                  <FormControl>
                    <Input placeholder="Field value" {...field} />
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
                  const fields = form.getValues("customFields");
                  form.setValue(
                    "customFields",
                    fields.filter((_, i) => i !== index)
                  );
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Field
              </Button>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => {
            const fields = form.getValues("customFields");
            form.setValue("customFields", [
              ...fields,
              { key: "", value: "" },
            ]);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Field
        </Button>
      </CardContent>
    </Card>
  );
}
