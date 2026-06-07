"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Client } from "@prisma/client";
import { useState, useEffect, useMemo } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import * as z from "zod";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CurrencySelect } from "@/components/ui/currency-select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import SubmitButton from "@/components/submit-button/SubmitButton";
import { recurringInvoiceSchema } from "@/lib/zodSchemas";
import { createRecurringInvoice } from "@/app/actions/recurringInvoices";
import { useUser } from "@/components/providers/UserProvider";
import { toFormData } from "@/lib/toFormData";
import { useRouter } from "next/navigation";
import { Currency } from "@/types";
import { calculateInvoiceTotal } from "@/lib/invoiceItems";
import { InvoiceItemsFieldArray } from "@/components/invoice-form/InvoiceItemsFieldArray";

type FormValues = z.infer<typeof recurringInvoiceSchema>;

interface RecurringInvoiceFormProps {
  clients: Client[];
  onSuccess?: () => void;
  onClose?: () => void;
}

export function RecurringInvoiceForm({
  clients,
  onSuccess,
  onClose,
}: RecurringInvoiceFormProps) {
  const { firstName, lastName, email, companyName, companyEmail, companyAddress, address } =
    useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(recurringInvoiceSchema),
    defaultValues: {
      interval: "MONTHLY",
      invoiceName: "",
      fromName: companyName || `${firstName} ${lastName}`.trim(),
      fromEmail: companyEmail || email || "",
      fromAddress: companyAddress || address || "",
      clientId: "",
      currency: "USD",
      dueDate: 30,
      items: [{ description: "", quantity: 1, rate: 1 }],
      total: 0,
      startDate: new Date().toISOString().split("T")[0],
      note: "",
    },
  });

  const clientId = form.watch("clientId");
  const selectedClient = clients.find((c) => c.id === clientId) ?? null;

  const currency = form.watch("currency") as Currency;
  const watchedItems = form.watch("items");
  const total = useMemo(() => calculateInvoiceTotal(watchedItems ?? []), [watchedItems]);

  useEffect(() => {
    form.setValue("total", total, { shouldValidate: false });
  }, [total, form]);

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      const submitFormData = toFormData(values as Record<string, unknown>);
      const result = await createRecurringInvoice(null, submitFormData);

      if (result.status === "error") {
        const msgs = Object.values(result.error ?? {}).flat();
        toast.error(msgs[0] ?? "Failed to create recurring invoice");
        return;
      }

      toast.success("Recurring invoice created");
      router.refresh();
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create recurring invoice");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4 sm:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {/* Badge + invoice name */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <Badge variant="secondary" className="w-fit">
                Recurring
              </Badge>
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Recurrence, currency, start date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <FormField
                control={form.control}
                name="interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurrence</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <CurrencySelect
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full text-left justify-start"
                          >
                            <CalendarIcon className="mr-2 size-4" />
                            {field.value ? (
                              format(new Date(field.value + "T12:00:00"), "PPP")
                            ) : (
                              <span>Pick a Date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            field.value
                              ? new Date(field.value + "T12:00:00")
                              : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(
                              date
                                ? date.toISOString().split("T")[0]
                                : new Date().toISOString().split("T")[0]
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

            {/* From / To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label className="mb-2 block">From</Label>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="fromName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fromEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Your Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fromAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Your Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">To</Label>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {selectedClient && (
                    <>
                      <Input value={selectedClient.name} disabled />
                      <Input value={selectedClient.email ?? ""} disabled />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Due date + end date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (days after invoice)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full text-left justify-start"
                          >
                            <CalendarIcon className="mr-2 size-4" />
                            {field.value ? (
                              format(
                                new Date(field.value + "T12:00:00"),
                                "PPP"
                              )
                            ) : (
                              <span className="text-muted-foreground">
                                No end date
                              </span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            field.value
                              ? new Date(field.value + "T12:00:00")
                              : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(
                              date ? date.toISOString().split("T")[0] : ""
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

            <InvoiceItemsFieldArray<FormValues> control={form.control} currency={currency} />

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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4">
              <div className="flex gap-3 w-full sm:w-auto">
                {onClose && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCancelConfirm(true)}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                )}
                <SubmitButton
                  text="Create Recurring Invoice"
                  isLoading={isLoading}
                />
              </div>
            </div>
          </form>
        </Form>
      </CardContent>

      <ConfirmDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title="Discard changes?"
        description="Your unsaved changes will be lost. This action cannot be undone."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={() => onClose?.()}
      />
    </Card>
  );
}
