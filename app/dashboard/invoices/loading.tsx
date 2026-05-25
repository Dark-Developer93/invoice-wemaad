import { InvoiceListSkeleton } from "@/components/invoice-list/InvoiceList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-2xl font-bold">Invoices</CardTitle>
            <CardDescription>Manage your invoices right here</CardDescription>
          </div>
          <Skeleton className="h-9 w-full sm:w-36" />
        </div>
      </CardHeader>
      <CardContent>
        <InvoiceListSkeleton />
      </CardContent>
    </Card>
  );
}
