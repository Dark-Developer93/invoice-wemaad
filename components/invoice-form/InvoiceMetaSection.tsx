"use client";

import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CurrencySelect } from "@/components/ui/currency-select";
import { useInvoiceForm } from "./InvoiceFormContext";

export function InvoiceMetaSection() {
  const { form } = useInvoiceForm();

  return (
    <>
      {/* Invoice name + badge */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <Badge variant="secondary" className="w-fit">Draft</Badge>
        <FormField
          control={form.control}
          name="invoiceName"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="Enter invoice name"
                  className="w-full"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Invoice number, currency, date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <FormField
          control={form.control}
          name="invoiceNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice No.</FormLabel>
              <div className="flex">
                <span className="px-3 border border-r-0 rounded-l-md bg-muted flex items-center text-sm">
                  #
                </span>
                <FormControl>
                  <Input
                    className="rounded-l-none"
                    placeholder="5"
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <CurrencySelect value={field.value} onValueChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <Popover modal>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className="w-full text-left justify-start"
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick a Date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={new Date(field.value)}
                    onSelect={(date) =>
                      field.onChange(
                        date ? date.toISOString() : new Date().toISOString()
                      )
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
