"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatCurrency";
import { Currency } from "@/types";

interface ViewInvoiceDialogProps {
  invoice: {
    id: string;
    invoiceName: string;
    total: number;
    status: "PAID" | "PENDING";
    date: Date;
    dueDate: number;
    fromName: string;
    fromEmail: string;
    fromAddress: string;
    currency: string;
    invoiceNumber: number;
    invoiceNote: string | null;
    invoiceItemDescription: string;
    invoiceItemQuantity: number;
    invoiceItemRate: number;
    client: {
      name: string;
      email: string | null;
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
    } | null;
  };
  trigger: ReactNode;
}

export function ViewInvoiceDialog({
  invoice,
  trigger,
}: ViewInvoiceDialogProps) {
  const dueDate = new Date(invoice.date);
  dueDate.setDate(dueDate.getDate() + invoice.dueDate);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            View detailed information about this invoice.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{invoice.invoiceName}</h2>
              <div className="text-sm text-muted-foreground mt-1">
                #{invoice.invoiceNumber}
              </div>
            </div>
            <Badge
              variant={invoice.status === "PAID" ? "default" : "secondary"}
            >
              {invoice.status}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">From</h3>
                <div className="space-y-1 text-sm">
                  <div>{invoice.fromName}</div>
                  <div>{invoice.fromEmail}</div>
                  <div className="whitespace-pre-line">
                    {invoice.fromAddress}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">To</h3>
                {invoice.client ? (
                  <div className="space-y-1 text-sm">
                    <div>{invoice.client.name}</div>
                    <div>{invoice.client.email}</div>
                    {invoice.client.addresses[0] && (
                      <div className="whitespace-pre-line">
                        {[
                          invoice.client.addresses[0].street,
                          invoice.client.addresses[0].city,
                          invoice.client.addresses[0].state,
                          invoice.client.addresses[0].country,
                          invoice.client.addresses[0].zipCode,
                        ]
                          .filter(Boolean)
                          .join("\n")}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No client information
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-12 gap-4 mb-2 font-medium">
                <p className="col-span-6">Description</p>
                <p className="col-span-2">Quantity</p>
                <p className="col-span-2">Rate</p>
                <p className="col-span-2">Amount</p>
              </div>

              <div className="grid grid-cols-12 gap-4 mb-4">
                <div className="col-span-6">
                  <div className="whitespace-pre-line">
                    {invoice.invoiceItemDescription}
                  </div>
                </div>
                <div className="col-span-2">{invoice.invoiceItemQuantity}</div>
                <div className="col-span-2">
                  {formatCurrency({
                    amount: invoice.invoiceItemRate,
                    currency: invoice.currency as Currency,
                  })}
                </div>
                <div className="col-span-2">
                  {formatCurrency({
                    amount: invoice.total,
                    currency: invoice.currency as Currency,
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-1/3">
                  <div className="flex justify-between py-2">
                    <span>Subtotal</span>
                    <span>
                      {formatCurrency({
                        amount: invoice.total,
                        currency: invoice.currency as Currency,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-t">
                    <span>Total ({invoice.currency})</span>
                    <span className="font-medium">
                      {formatCurrency({
                        amount: invoice.total,
                        currency: invoice.currency as Currency,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Dates</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Invoice Date: </span>
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "long",
                  }).format(new Date(invoice.date))}
                </div>
                <div>
                  <span className="text-muted-foreground">Due Date: </span>
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "long",
                  }).format(dueDate)}
                </div>
              </div>
            </div>

            {invoice.invoiceNote && (
              <div>
                <h3 className="font-medium mb-2">Notes</h3>
                <div className="text-sm whitespace-pre-line">
                  {invoice.invoiceNote}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
