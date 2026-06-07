"use client";

import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useInvoiceForm, InvoiceFormValues } from "./InvoiceFormContext";
import { InvoiceItemsFieldArray } from "./InvoiceItemsFieldArray";

export function InvoiceItemsSection() {
  const { form, currency } = useInvoiceForm();

  return (
    <>
      <InvoiceItemsFieldArray<InvoiceFormValues> control={form.control} currency={currency} />

      {/* Note */}
      <div className="mb-6">
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add your Note/s right here..."
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
