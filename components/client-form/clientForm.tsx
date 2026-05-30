"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { Client } from "@/app/dashboard/clients/columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clientFormSchema } from "@/lib/zodSchemas";
import { createClient, editClient } from "@/app/actions/clients";
import { toFormData } from "@/lib/toFormData";
import { useRouter } from "next/navigation";
import SubmitButton from "@/components/submit-button/SubmitButton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState } from "react";
import { ClientFormProvider } from "./ClientFormContext";
import { BasicInfoTab } from "./BasicInfoTab";
import { AddressesTab } from "./AddressesTab";
import { ContactPersonsTab } from "./ContactPersonsTab";
import { CustomFieldsTab } from "./CustomFieldsTab";

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  client?: Client & {
    addresses: Array<{
      id?: string;
      type: "BILLING" | "SHIPPING" | "OTHER";
      street: string;
      city: string;
      state: string | null;
      country: string;
      zipCode: string;
      isDefault: boolean;
    }>;
    contactPersons: Array<{
      id?: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
      position: string | null;
      isPrimary: boolean;
    }>;
    customFields: Array<{
      id?: string;
      key: string;
      value: string;
    }>;
  };
  onClose?: () => void;
  onSuccess?: () => void;
}

export function ClientForm({ client, onClose, onSuccess }: ClientFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: client
      ? {
          ...client,
          addresses: client.addresses.map((addr) => ({
            type: addr.type,
            street: addr.street,
            city: addr.city,
            state: addr.state || undefined,
            country: addr.country,
            zipCode: addr.zipCode,
            isDefault: addr.isDefault,
          })),
          contactPersons: client.contactPersons.map((contact) => ({
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone || undefined,
            position: contact.position || undefined,
            isPrimary: contact.isPrimary,
          })),
          customFields: client.customFields.map((field) => ({
            key: field.key,
            value: field.value,
          })),
        }
      : {
          name: "",
          email: "",
          phone: "",
          taxId: "",
          website: "",
          notes: "",
          category: "",
          addresses: [
            {
              type: "BILLING",
              street: "",
              city: "",
              state: "",
              country: "",
              zipCode: "",
              isDefault: true,
            },
          ],
          contactPersons: [],
          customFields: [],
        },
  });

  function onInvalid() {
    const errors = form.formState.errors;
    if ((errors.contactPersons as { message?: string })?.message) {
      toast.error("At least one contact person is required. Go to the Contacts tab.");
    } else {
      toast.error("Please fix the form errors before submitting.");
    }
  }

  async function onSubmit(data: ClientFormValues) {
    try {
      setIsLoading(true);
      const formData = toFormData(data as Record<string, unknown>);

      const result = client
        ? await editClient(client.id, null, formData)
        : await createClient(null, formData);

      if (result.status === "error") {
        console.error("Form validation errors:", result.error);
        toast.error("Failed to update client. Please check the form for errors.");
        return;
      }

      toast.success(client ? "Client updated" : "Client created");
      router.refresh();
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <ClientFormProvider value={{ form }}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="custom">Custom Fields</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <BasicInfoTab />
          </TabsContent>

          <TabsContent value="addresses" className="space-y-4">
            <AddressesTab />
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <ContactPersonsTab />
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <CustomFieldsTab />
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end mt-6">
          <div className="flex justify-end gap-4">
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel
              </Button>
            )}
            <SubmitButton
              text={client ? "Update Client" : "Create Client"}
              isLoading={isLoading}
            />
          </div>
        </div>
      </form>
      </ClientFormProvider>

      <ConfirmDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title="Discard changes?"
        description="Your unsaved changes will be lost. This action cannot be undone."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={() => onClose?.()}
      />
    </Form>
  );
}
