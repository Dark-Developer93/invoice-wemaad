import { Suspense } from "react";
import { Metadata } from "next";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { ClientDialog } from "@/components/client-form/clientDialog";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { cacheTags } from "@/lib/cache";

export const metadata: Metadata = {
  title: "Clients",
  description: "Manage your client directory — add, edit, and view client contact details.",
  robots: { index: false, follow: false },
};

// Cached until invalidated by revalidateTag(cacheTags.clients(userId)) in
// every client-mutating action — no time-based staleness.
async function getClients(userId: string) {
  const clients = await unstable_cache(
    () =>
      prisma.client.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          category: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          taxId: true,
          website: true,
          notes: true,
          tags: true,
          addresses: {
            where: { isDefault: true },
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
            take: 1,
          },
          contactPersons: {
            where: { isPrimary: true },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              position: true,
              isPrimary: true,
            },
            take: 1,
          },
          customFields: {
            select: { id: true, key: true, value: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ["clients-list", userId],
    { tags: [cacheTags.clients(userId)] }
  )();

  // unstable_cache serializes its return value, so Date fields come back as
  // ISO strings on a cache hit — normalize back to Date so callers always
  // get the same shape regardless of cache hit/miss.
  return clients.map((client) => ({
    ...client,
    createdAt: new Date(client.createdAt),
    updatedAt: new Date(client.updatedAt),
  }));
}

async function ClientsTable({ userId }: { userId: string }) {
  const clients = await getClients(userId);

  if (clients.length === 0) {
    return (
      <EmptyState
        title="No clients found"
        description="Add your first client to start creating invoices."
        button={<ClientDialog />}
      />
    );
  }

  return <DataTable columns={columns} data={clients} />;
}

function ClientsTableSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="border-b p-4 flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-9 w-full sm:w-56" />
        <Skeleton className="h-9 w-full sm:w-40" />
      </div>
      <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_auto_auto_auto] border-b px-4 py-3 gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-8" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-4 py-3 border-b last:border-0">
          <div className="flex items-center justify-between sm:hidden">
            <div className="space-y-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-8 w-8 shrink-0" />
          </div>
          <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function ClientsPage() {
  const session = await requireUser();

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Manage your client directory and their information.
          </p>
        </div>
        <ClientDialog />
      </div>
      <Suspense fallback={<ClientsTableSkeleton />}>
        <ClientsTable userId={session.user!.id!} />
      </Suspense>
    </div>
  );
}
