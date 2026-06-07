"use client";

import { ArrayPath, Control, FieldValues, Path, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { formatCurrency } from "@/lib/formatCurrency";
import { calculateInvoiceTotal, InvoiceItem } from "@/lib/invoiceItems";
import { Currency } from "@/types";

interface InvoiceItemsFieldArrayProps<TFieldValues extends FieldValues & { items: InvoiceItem[] }> {
  control: Control<TFieldValues>;
  items: InvoiceItem[];
  currency: Currency;
}

const EMPTY_ITEM: InvoiceItem = { description: "", quantity: 1, rate: 1 };

export function InvoiceItemsFieldArray<TFieldValues extends FieldValues & { items: InvoiceItem[] }>({
  control,
  items,
  currency,
}: InvoiceItemsFieldArrayProps<TFieldValues>) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items" as ArrayPath<TFieldValues>,
  });
  const total = calculateInvoiceTotal(items);

  return (
    <>
      <div className="mb-4">
        <div className="hidden md:grid md:grid-cols-12 gap-4 mb-2 font-medium text-sm">
          <p className="col-span-6">Description</p>
          <p className="col-span-2">Quantity</p>
          <p className="col-span-2">Rate</p>
          <p className="col-span-2">Amount</p>
        </div>

        {fields.map((field, index) => {
          const item = items[index];
          const amount = (item?.quantity || 0) * (item?.rate || 0);

          return (
            <div
              key={field.id}
              className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 mb-3 md:mb-4 pb-3 md:pb-0 border-b md:border-0 last:border-0"
            >
              <div className="md:col-span-6">
                <Label className="md:hidden mb-1 block text-sm">Description</Label>
                <FormField
                  control={control}
                  name={`items.${index}.description` as Path<TFieldValues>}
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
                    control={control}
                    name={`items.${index}.quantity` as Path<TFieldValues>}
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
                              field.onChange(val === "" ? 0 : parseFloat(val) || 0);
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
                    control={control}
                    name={`items.${index}.rate` as Path<TFieldValues>}
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
                              field.onChange(val === "" ? 0 : parseFloat(val) || 0);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-2 min-w-0 flex gap-2 items-start">
                  <div className="flex-1 min-w-0">
                    <Label className="md:hidden mb-1 block text-sm">Amount</Label>
                    <Input value={formatCurrency({ amount, currency })} disabled />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(EMPTY_ITEM as never)}
        >
          <Plus className="size-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-full sm:w-1/2 md:w-1/3">
          <div className="flex justify-between py-2 text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency({ amount: total, currency })}</span>
          </div>
          <div className="flex justify-between py-2 border-t text-sm">
            <span>Total ({currency})</span>
            <span className="font-medium underline underline-offset-2">
              {formatCurrency({ amount: total, currency })}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
