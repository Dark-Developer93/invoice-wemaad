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
          <Table>
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
        )}
      </CardContent>
    </Card>
  );
}
