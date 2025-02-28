import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceDialog } from "@/components/invoice-dialog/InvoiceDialog";
import { ViewInvoiceDialog } from "@/components/invoice-dialog/ViewInvoiceDialog";

export const metadata: Metadata = {
  title: "Client Details | WeMaAd Invoice",
  description: "View client details and information",
};

interface PageProps {
  params: {
    clientId: string;
  };
}

export default async function ClientDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [client, user, allClients] = await Promise.all([
    prisma.client.findUnique({
      where: {
        id: params.clientId,
        userId: session.user.id,
      },
      include: {
        addresses: true,
        contactPersons: true,
        customFields: true,
        invoices: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstName: true,
        lastName: true,
        address: true,
        email: true,
      },
    }),
    prisma.client.findMany({
      where: { userId: session.user.id },
      include: {
        addresses: {
          select: {
            id: true,
            type: true,
            street: true,
            city: true,
            state: true,
            country: true,
            zipCode: true,
            isDefault: true,
          },
        },
        contactPersons: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            position: true,
            isPrimary: true,
          },
        },
      },
    }),
  ]);

  if (!client || !user) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col items-start gap-2">
          <Link href="/dashboard/clients" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <p className="text-sm text-muted-foreground hover:text-primary hover:underline">
              Back to Clients
            </p>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
          {client.category && (
            <Badge variant="secondary">{client.category}</Badge>
          )}
        </div>
        <div className="flex gap-4">
          <InvoiceDialog
            firstName={user.firstName || ""}
            lastName={user.lastName || ""}
            address={user.address || ""}
            email={user.email}
            clients={allClients}
            defaultClientId={client.id}
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            }
          />
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="contacts">Contact Persons</TabsTrigger>
          <TabsTrigger value="custom">Custom Fields</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Email
                  </dt>
                  <dd className="mt-1">{client.email || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Phone
                  </dt>
                  <dd className="mt-1">{client.phone || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Tax ID
                  </dt>
                  <dd className="mt-1">{client.taxId || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Website
                  </dt>
                  <dd className="mt-1">
                    {client.website ? (
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {client.website}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                {client.notes && (
                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Notes
                    </dt>
                    <dd className="mt-1 whitespace-pre-line">{client.notes}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {client.invoices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {client.invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{invoice.invoiceName}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(invoice.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={
                            invoice.status === "PAID" ? "default" : "secondary"
                          }
                        >
                          {invoice.status}
                        </Badge>
                        <ViewInvoiceDialog
                          invoice={{
                            ...invoice,
                            client: {
                              name: client.name,
                              email: client.email,
                              addresses: client.addresses,
                              contactPersons: client.contactPersons,
                            },
                          }}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          }
                        />
                        <InvoiceDialog
                          invoice={{
                            ...invoice,
                            client: {
                              name: client.name,
                              email: client.email,
                              addresses: client.addresses.map((addr) => ({
                                street: addr.street,
                                isDefault: addr.isDefault,
                              })),
                            },
                          }}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {client.addresses.map((address) => (
              <Card key={address.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge>{address.type}</Badge>
                    {address.isDefault && (
                      <Badge variant="outline">Default</Badge>
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
                    </div>
                    {contact.isPrimary && (
                      <Badge variant="outline">Primary</Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    {contact.position && (
                      <div className="text-muted-foreground">
                        {contact.position}
                      </div>
                    )}
                    <div>{contact.email}</div>
                    {contact.phone && <div>{contact.phone}</div>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          {client.customFields.length > 0 ? (
            <Card>
              <CardContent className="pt-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {client.customFields.map((field) => (
                    <div key={field.id}>
                      <dt className="text-sm font-medium text-muted-foreground">
                        {field.key}
                      </dt>
                      <dd className="mt-1">{field.value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No custom fields defined.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
