import { unstable_cache } from "next/cache";
import prisma from "@/lib/db";
import { cacheTags } from "@/lib/cache";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { calculateInvoiceTotal, parseInvoiceItems } from "@/lib/invoiceItems";
import { getPageInfo, PAGE_SIZES, type PageInfo } from "@/lib/pagination";
import type { InvoiceListRow } from "@/components/invoice-list/InvoiceListView";
import type { Currency } from "@/types";

// One page of a user's invoices, ready to render: rows carry pre-formatted
// amount/date strings (see InvoiceListView). Served as JSON by
// /api/invoices, so the invoices page itself is a light shell.
//
// Paginated: a user's invoice list grows without bound. Both reads are
// cached until invalidated by revalidateTag(cacheTags.invoices(userId)) in
// every invoice-mutating action — no time-based staleness.
function getInvoiceCount(userId: string) {
  return unstable_cache(
    () => prisma.invoice.count({ where: { userId } }),
    ["invoice-count", userId],
    { tags: [cacheTags.invoices(userId)] }
  )();
}

export interface InvoiceListPage {
  rows: InvoiceListRow[];
  pageInfo: PageInfo;
  totalCount: number;
}

export async function getInvoiceListPage(userId: string, requestedPage: number): Promise<InvoiceListPage> {
  const totalCount = await getInvoiceCount(userId);
  const pageInfo = getPageInfo(requestedPage, totalCount, PAGE_SIZES.invoices);

  const data = await unstable_cache(
    () =>
      prisma.invoice.findMany({
        relationLoadStrategy: "query", // nested to-many lists: see prisma/schema.prisma
        where: { userId },
        include: {
          // Each row ships this to the client (InvoiceActions props), so only
          // send what its view/edit dialogs actually show — the default
          // address and primary contact, not every one the client has.
          client: {
            select: {
              name: true,
              email: true,
              addresses: { orderBy: { isDefault: "desc" }, take: 1 },
              contactPersons: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
        // id breaks createdAt ties, so a row can't appear on two pages.
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: pageInfo.skip,
        take: pageInfo.take,
      }),
    ["invoice-list", userId, String(pageInfo.page), String(PAGE_SIZES.invoices)],
    { tags: [cacheTags.invoices(userId)] }
  )();

  const rows = data.map((raw) => {
    // unstable_cache returns dates as ISO strings on a cache hit.
    const invoice = {
      ...raw,
      date: new Date(raw.date),
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
    };
    return {
      invoice,
      amountLabel: formatCurrency({
        amount: calculateInvoiceTotal(parseInvoiceItems(invoice.items)),
        currency: invoice.currency as Currency,
      }),
      dateLabel: formatDate.short(invoice.createdAt),
    };
  });

  return { rows, pageInfo, totalCount };
}
