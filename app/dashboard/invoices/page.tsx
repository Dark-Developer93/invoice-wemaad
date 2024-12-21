import { Suspense } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import {
  InvoiceList,
  InvoiceListSkeleton,
} from "@/components/invoice-list/InvoiceList";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function InvoicesRoute() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Invoices</CardTitle>
            <CardDescription>Manage your invoices right here</CardDescription>
          </div>
          <Link href="/dashboard/invoices/create" className={buttonVariants()}>
            <PlusIcon /> Create Invoice
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<InvoiceListSkeleton />}>
          <InvoiceList />
        </Suspense>
      </CardContent>
    </Card>
  );
}
