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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useClientForm } from "./ClientFormContext";

export function AddressesTab() {
  const { form } = useClientForm();
  return (
    <Card>
      <CardContent className="pt-6">
        {form.watch("addresses")?.map((_, index) => (
          <div
            key={index}
            className="grid gap-4 md:grid-cols-2 mb-8 pb-8 border-b last:mb-0 last:pb-0 last:border-0"
          >
            <FormField
              control={form.control}
              name={`addresses.${index}.type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select address type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BILLING">Billing</SelectItem>
                      <SelectItem value="SHIPPING">Shipping</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`addresses.${index}.street`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input placeholder="Street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`addresses.${index}.city`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`addresses.${index}.state`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province</FormLabel>
                  <FormControl>
                    <Input placeholder="State/Province" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`addresses.${index}.country`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`addresses.${index}.zipCode`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP/Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="ZIP/Postal code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-1 sm:col-span-2 flex justify-end gap-2">
              {index > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const addresses = form.getValues("addresses");
                    form.setValue(
                      "addresses",
                      addresses.filter((_, i) => i !== index)
                    );
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Address
                </Button>
              )}
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => {
            const addresses = form.getValues("addresses");
            form.setValue("addresses", [
              ...addresses,
              {
                type: "BILLING",
                street: "",
                city: "",
                state: "",
                country: "",
                zipCode: "",
                isDefault: false,
              },
            ]);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </CardContent>
    </Card>
  );
}
