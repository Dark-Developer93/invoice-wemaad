"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formatCurrency } from "@/lib/formatCurrency";
import { useInvoiceForm } from "./InvoiceFormContext";

export function InvoiceItemsSection() {
  const { form, currency, localTotal } = useInvoiceForm();

  return (
    <>
      {/* Invoice items */}
      <div className="mb-4">
        <div className="hidden md:grid md:grid-cols-12 gap-4 mb-2 font-medium text-sm">
          <p className="col-span-6">Description</p>
          <p className="col-span-2">Quantity</p>
          <p className="col-span-2">Rate</p>
          <p className="col-span-2">Amount</p>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4">
          <div className="md:col-span-6">
            <Label className="md:hidden mb-1 block text-sm">Description</Label>
            <FormField
              control={form.control}
              name="invoiceItemDescription"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Item name & description"
                      className="resize-none"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 md:contents">
            <div className="md:col-span-2 min-w-0">
              <Label className="md:hidden mb-1 block text-sm">Quantity</Label>
              <FormField
                control={form.control}
                name="invoiceItemQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        step="any"
                        min="0.01"
                        {...field}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(
                            val === "" ? 0 : parseFloat(val) || 0
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2 min-w-0">
              <Label className="md:hidden mb-1 block text-sm">Rate</Label>
              <FormField
                control={form.control}
                name="invoiceItemRate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="any"
                        min="0.01"
                        {...field}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(
                            val === "" ? 0 : parseFloat(val) || 0
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2 min-w-0">
              <Label className="md:hidden mb-1 block text-sm">Amount</Label>
              <Input
                value={formatCurrency({ amount: localTotal, currency })}
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-full sm:w-1/2 md:w-1/3">
          <div className="flex justify-between py-2 text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency({ amount: localTotal, currency })}</span>
          </div>
          <div className="flex justify-between py-2 border-t text-sm">
            <span>Total ({currency})</span>
            <span className="font-medium underline underline-offset-2">
              {formatCurrency({ amount: localTotal, currency })}
            </span>
          </div>
        </div>
      </div>

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
