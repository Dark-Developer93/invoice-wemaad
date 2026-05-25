"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Mail } from "lucide-react";
import { toast } from "sonner";
import { Prisma, Client } from "@prisma/client";
import { format } from "date-fns";
import { useState, useEffect, useMemo } from "react";
import debounce from "lodash/debounce";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import SubmitButton from "@/components/submit-button/SubmitButton";
import { createInvoice, editInvoice } from "@/app/actions/invoices";
import { invoiceSchema } from "@/lib/zodSchemas";
import { formatCurrency } from "@/lib/formatCurrency";
import { Currency } from "@/types";
import { useRouter } from "next/navigation";
import * as z from "zod";

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  mode: "create" | "edit";
  firstName?: string;
  lastName?: string;
  address?: string;
  email?: string;
  companyName?: string;
  companyEmail?: string;
  companyAddress?: string;
  defaultClientId?: string;
  clients?: (Client & {
    addresses: Array<{
      id: string;
      type: "BILLING" | "SHIPPING" | "OTHER";
      street: string;
      city: string;
      state: string | null;
      country: string;
      zipCode: string;
      isDefault: boolean;
    }>;
    contactPersons: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
      position: string | null;
      isPrimary: boolean;
    }>;
  })[];
  data?: Prisma.InvoiceGetPayload<{
    include: {
      client: {
        select: {
          name: true;
          email: true;
          addresses: {
            select: {
              street: true;
              isDefault: true;
            };
          };
        };
      };
    };
  }>;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function InvoiceForm({
  mode,
  firstName = "",
  lastName = "",
  address = "",
  email = "",
  companyName = "",
  companyEmail = "",
  companyAddress = "",
  clients = [],
  defaultClientId,
  data,
  onSuccess,
  onClose,
}: InvoiceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [localTotal, setLocalTotal] = useState(
    mode === "edit" ? Number(data?.total) || 0 : 0
  );

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceName: mode === "edit" ? data?.invoiceName || "" : "",
      invoiceNumber: mode === "edit" ? Number(data?.invoiceNumber) || 1 : 1,
      currency: mode === "edit" ? data?.currency || "USD" : "USD",
      date:
        mode === "edit"
          ? data?.date
            ? new Date(data.date).toISOString()
            : new Date().toISOString()
          : new Date().toISOString(),
      dueDate: mode === "edit" ? Number(data?.dueDate) || 0 : 0,
      fromName:
        mode === "edit"
          ? data?.fromName || ""
          : companyName || `${firstName} ${lastName}`,
      fromEmail:
        mode === "edit" ? data?.fromEmail || "" : companyEmail || email || "",
      fromAddress:
        mode === "edit"
          ? data?.fromAddress || ""
          : companyAddress || address || "",
      clientId: mode === "edit" ? data?.clientId || "" : defaultClientId || "",
      invoiceItemDescription:
        mode === "edit" ? data?.invoiceItemDescription || "" : "",
      invoiceItemQuantity:
        mode === "edit" ? Number(data?.invoiceItemQuantity) || 1 : 1,
      invoiceItemRate: mode === "edit" ? Number(data?.invoiceItemRate) || 1 : 1,
      total: mode === "edit" ? Number(data?.total) || 0 : 0,
      note: mode === "edit" ? data?.invoiceNote || "" : "",
      status:
        mode === "edit"
          ? (data?.status as "PAID" | "PENDING") || "PENDING"
          : "PENDING",
    },
  });

  const selectedClient = useMemo(() => {
    const clientId = form.getValues("clientId");
    return clientId ? clients.find((c) => c.id === clientId) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("clientId"), clients]);

  const currency = form.watch("currency") as Currency;

  const updateTotal = useMemo(
    () =>
      debounce((quantity: number, rate: number) => {
        const calculatedTotal = Math.round(quantity * rate * 100) / 100;
        setLocalTotal(calculatedTotal);
        form.setValue("total", calculatedTotal, { shouldValidate: true });
      }, 300),
    [form]
  );

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "invoiceItemQuantity" || name === "invoiceItemRate") {
        const quantity = form.getValues("invoiceItemQuantity") || 0;
        const rate = form.getValues("invoiceItemRate") || 0;
        updateTotal(quantity, rate);
      }
    });

    return () => {
      subscription.unsubscribe();
      updateTotal.cancel();
    };
  }, [form, updateTotal]);

  useEffect(() => {
    const quantity = form.getValues("invoiceItemQuantity") || 0;
    const rate = form.getValues("invoiceItemRate") || 0;
    updateTotal(quantity, rate);
  }, []);

  async function onSubmit(formData: InvoiceFormValues) {
    try {
      setIsLoading(true);
      const submitFormData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          submitFormData.append(key, value.toString());
        }
      });

      submitFormData.append("sendEmail", sendEmail ? "true" : "false");

      if (mode === "edit") {
        submitFormData.append("id", data?.id || "");
      }

      const result =
        mode === "create"
          ? await createInvoice(null, submitFormData)
          : await editInvoice(null, submitFormData);

      if (result.status === "error") {
        const msgs = Object.values(result.error ?? {}).flat();
        toast.error(msgs[0] ?? "Failed to save invoice");
        return;
      }

      toast.success(
        mode === "create"
          ? "Invoice created successfully"
          : "Invoice updated successfully"
      );
      router.refresh();
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${mode} invoice`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4 sm:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
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
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">United States Dollar -- USD</SelectItem>
                        <SelectItem value="EUR">Euro -- EUR</SelectItem>
                        <SelectItem value="EGP">Egyptian Pound -- EGP</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Popover>
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
                          fromDate={new Date()}
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
                  {mode === "create" ? (
                    <>
                      <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a client" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {clients.map((client) => (
                                  <SelectItem key={client.id} value={client.id}>
                                    {client.name}
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
                          <Input
                            value={
                              selectedClient.contactPersons.find(
                                (cp) => cp.isPrimary
                              )?.email || ""
                            }
                            disabled
                          />
                          <Input
                            value={
                              selectedClient.addresses.find((a) => a.isDefault)
                                ?.street || ""
                            }
                            disabled
                          />
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <input type="hidden" {...form.register("clientId")} />
                      <Input value={data?.client?.name ?? ""} disabled placeholder="Client Name" />
                      <Input value={data?.client?.email ?? ""} disabled placeholder="Client Email" />
                      <Input
                        value={
                          data?.client?.addresses.find(
                            (a: { isDefault: boolean; street: string }) => a.isDefault
                          )?.street ?? ""
                        }
                        disabled
                        placeholder="Client Address"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice items — responsive: stacked on mobile, grid on md+ */}
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

                <div className="grid grid-cols-3 gap-3 md:contents">
                  <div className="md:col-span-2">
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
                                field.onChange(val === "" ? 0 : parseFloat(val) || 0);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-2">
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
                                field.onChange(val === "" ? 0 : parseFloat(val) || 0);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-2">
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

            {/* Email toggle + actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="send-email"
                  checked={sendEmail}
                  onCheckedChange={setSendEmail}
                />
                <div className="flex items-center gap-1.5">
                  <Mail className="size-4 text-muted-foreground" />
                  <label
                    htmlFor="send-email"
                    className="text-sm cursor-pointer select-none"
                  >
                    {sendEmail ? "Send email to client" : "Don't send email"}
                  </label>
                </div>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                {onClose && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      toast.info("Invoice discarded. Your changes have not been saved.");
                      onClose();
                    }}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                )}
                <SubmitButton
                  text={
                    mode === "create"
                      ? sendEmail
                        ? "Send Invoice to Client"
                        : "Create Invoice"
                      : sendEmail
                      ? "Update & Notify Client"
                      : "Update Invoice"
                  }
                  isLoading={isLoading}
                />
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
