import { DashboardBlocksSkeleton } from "@/components/dashboard-blocks/DashboardBlocks";
import { InvoiceGraphSkeleton } from "@/components/invoice-graph/InvoiceGraph";
import { RecentInvoicesSkeleton } from "@/components/recent-invoices/RecentInvoices";

export default function Loading() {
  return (
    <div className="space-y-8">
      <DashboardBlocksSkeleton />
      <div className="grid gap-4 lg:grid-cols-3 md:gap-8">
        <InvoiceGraphSkeleton />
        <RecentInvoicesSkeleton />
      </div>
    </div>
  );
}
