import { InvoiceListSkeleton } from "@/components/invoice-list/InvoiceList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Loading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Invoices</CardTitle>
            <CardDescription>Manage your invoices right here</CardDescription>
          </div>
          <div className="w-[150px] h-[36px] bg-muted rounded-md animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <InvoiceListSkeleton />
      </CardContent>
    </Card>
  );
}
