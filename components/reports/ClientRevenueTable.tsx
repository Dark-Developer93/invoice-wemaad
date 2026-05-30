import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ClientRevenue {
  clientId: string;
  clientName: string;
  total: number;
  invoiceCount: number;
}

interface ClientRevenueTableProps {
  data: ClientRevenue[];
  currency?: string;
}

export function ClientRevenueTable({ data, currency = "USD" }: ClientRevenueTableProps) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(v / 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Clients by Revenue</CardTitle>
        <CardDescription>Your highest-value clients this year</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">No client data yet.</p>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="md:hidden space-y-2">
              {data.map((row) => (
                <div
                  key={row.clientId}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium text-sm">{row.clientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.invoiceCount} invoice{row.invoiceCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="font-semibold text-sm">{fmt(row.total)}</span>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block overflow-x-auto">
              <Table className="min-w-[360px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Invoices</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.clientId}>
                      <TableCell className="font-medium">{row.clientName}</TableCell>
                      <TableCell className="text-right">{row.invoiceCount}</TableCell>
                      <TableCell className="text-right">{fmt(row.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
