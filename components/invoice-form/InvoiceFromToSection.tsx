"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useInvoiceForm } from "./InvoiceFormContext";

export function InvoiceFromToSection() {
  const { form, mode, clients, data, selectedClient } = useInvoiceForm();

  return (
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
                      selectedClient.contactPersons.find((cp) => cp.isPrimary)
                        ?.email || ""
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
              <Input
                value={data?.client?.name ?? ""}
                disabled
                placeholder="Client Name"
              />
              <Input
                value={data?.client?.email ?? ""}
                disabled
                placeholder="Client Email"
              />
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
  );
}
