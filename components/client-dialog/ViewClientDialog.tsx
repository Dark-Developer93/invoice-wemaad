"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/app/dashboard/clients/columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ViewClientDialogProps {
  client: Client;
  trigger: ReactNode;
}

export function ViewClientDialog({ client, trigger }: ViewClientDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto min-h-[450px]">
        <DialogHeader>
          <DialogTitle>Client Details</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold">{client.name}</h2>
            {client.category && (
              <Badge variant="secondary">{client.category}</Badge>
            )}
          </div>

          <Tabs defaultValue="details" className="w-full min-h-[270px]">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="contacts">Contact Persons</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardContent className="pt-6">
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Email
                      </dt>
                      <dd className="mt-1">{client.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Phone
                      </dt>
                      <dd className="mt-1">{client.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Website
                      </dt>
                      <dd className="mt-1">{client.website}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Tax ID
                      </dt>
                      <dd className="mt-1">{client.taxId}</dd>
                    </div>
                    {client.notes && (
                      <div className="col-span-2">
                        <dt className="text-sm font-medium text-muted-foreground">
                          Notes
                        </dt>
                        <dd className="mt-1 whitespace-pre-line">
                          {client.notes}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {client.addresses.map((address) => (
                  <Card key={address.id || `${address.street}-${address.city}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline">{address.type}</Badge>
                        {address.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div>{address.street}</div>
                        <div>
                          {address.city}
                          {address.state && `, ${address.state}`}
                        </div>
                        <div>{address.zipCode}</div>
                        <div>{address.country}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {client.contactPersons.map((contact) => (
                  <Card key={contact.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-medium">
                          {contact.firstName} {contact.lastName}
                          {contact.isPrimary && (
                            <Badge variant="secondary" className="ml-2">
                              Primary
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div>{contact.email}</div>
                        {contact.phone && <div>{contact.phone}</div>}
                        {contact.position && <div>{contact.position}</div>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
