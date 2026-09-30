import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getInvoiceListPage } from "@/lib/invoiceList";
import { parsePageParam } from "@/lib/pagination";

// JSON for the invoices page's list (fetched by InvoiceListClient), so the
// page itself renders as a light shell. Session-authorized and scoped to the
// caller's own invoices.
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.isActive) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = parsePageParam(request.nextUrl.searchParams.get("page") ?? undefined);
  const data = await getInvoiceListPage(session.user.id, page);

  return NextResponse.json(data, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
