"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState, useEffect, useMemo, useRef } from "react";
import debounce from "lodash/debounce";

import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createInvoice, editInvoice } from "@/app/actions/invoices";
import { invoiceSchema } from "@/lib/zodSchemas";
import { Currency } from "@/types";
import { toFormData } from "@/lib/toFormData";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/providers/UserProvider";

import { InvoiceFormProvider, InvoiceClient, InvoiceData, InvoiceFormValues } from "./InvoiceFormContext";
import { InvoiceMetaSection } from "./InvoiceMetaSection";
import { InvoiceFromToSection } from "./InvoiceFromToSection";
import { InvoiceItemsSection } from "./InvoiceItemsSection";
import { InvoiceActionsSection } from "./InvoiceActionsSection";

interface InvoiceFormProps {
  mode: "create" | "edit";
  defaultClientId?: string;
  clients?: InvoiceClient[];
  data?: InvoiceData;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function InvoiceForm({
  mode,
  clients = [],
  defaultClientId,
  data,
  onSuccess,
  onClose,
}: InvoiceFormProps) {
  const { firstName, lastName, address, email, companyName, companyEmail, companyAddress } =
    useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [localTotal, setLocalTotal] = useState(
    mode === "edit" ? Number(data?.total) || 0 : 0
  );

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceName: mode === "edit" ? data?.invoiceName || "" : "",
      invoiceNumber: mode === "edit" ? Number(data?.invoiceNumber) || 1 : 1,
      currency: (mode === "edit" ? data?.currency || "USD" : "USD") as Currency,
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
        mode === "edit" ? data?.fromAddress || "" : companyAddress || address || "",
      clientId: mode === "edit" ? data?.clientId || "" : defaultClientId || "",
      invoiceItemDescription: mode === "edit" ? data?.invoiceItemDescription || "" : "",
      invoiceItemQuantity: mode === "edit" ? Number(data?.invoiceItemQuantity) || 1 : 1,
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

  const updateTotal = useRef(
    debounce((quantity: number, rate: number) => {
      const calculatedTotal = Math.round(quantity * rate * 100) / 100;
      setLocalTotal(calculatedTotal);
      form.setValue("total", calculatedTotal, { shouldValidate: true });
    }, 300)
  ).current;

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
  }, [form]);

  useEffect(() => {
    const quantity = form.getValues("invoiceItemQuantity") || 0;
    const rate = form.getValues("invoiceItemRate") || 0;
    const calculatedTotal = Math.round(quantity * rate * 100) / 100;
    setLocalTotal(calculatedTotal);
    form.setValue("total", calculatedTotal, { shouldValidate: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(formData: InvoiceFormValues) {
    try {
      setIsLoading(true);
      const submitFormData = toFormData(formData as Record<string, unknown>);
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
        mode === "create" ? "Invoice created successfully" : "Invoice updated successfully"
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
        <InvoiceFormProvider
          value={{
            form,
            mode,
            clients,
            data,
            selectedClient,
            currency,
            localTotal,
            sendEmail,
            setSendEmail,
            isLoading,
            onClose,
            onCancelClick: () => setShowCancelConfirm(true),
          }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <InvoiceMetaSection />
              <InvoiceFromToSection />
              <InvoiceItemsSection />
              <InvoiceActionsSection />
            </form>
          </Form>
        </InvoiceFormProvider>
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
