import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

// A tiny in-memory stand-in for Next's data cache, keyed the same way.
const store = new Map<string, unknown>();
vi.mock("next/cache", () => ({
  unstable_cache:
    (fn: () => Promise<unknown>, keyParts: string[]) =>
    async () => {
      const key = JSON.stringify(keyParts);
      if (!store.has(key)) store.set(key, await fn());
      return store.get(key);
    },
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

const renders = vi.fn();
vi.mock("@react-pdf/renderer", () => ({
  pdf: (element: { props: { invoice: { invoiceName: string } } }) => {
    renders(element.props);
    const bytes = new TextEncoder().encode(`%PDF-fake ${element.props.invoice.invoiceName}`);
    return { toBlob: async () => new Blob([bytes]) };
  },
}));

vi.mock("@/components/pdf/InvoicePDF", () => ({ InvoicePDF: () => null }));
vi.mock("@/lib/db", () => ({ default: {} }));
// Branding (growth-loop footer) depends on the owner's plan.
vi.mock("@/lib/planConfig", () => ({
  getPlanConfig: async (plan: string) => ({
    brandingLevel: plan === "BUSINESS" ? "HIDDEN" : plan === "PRO" ? "MINIMAL" : "SHOWN",
  }),
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import { renderInvoicePDF, type InvoiceWithRelations } from "../invoicePdf";

function invoice(overrides: Record<string, unknown> = {}) {
  return {
    id: "inv-1",
    invoiceName: "Invoice 1",
    total: "300",
    updatedAt: new Date("2026-09-01T00:00:00Z"),
    client: { name: "Acme", addresses: [{ street: "1 Main St" }], contactPersons: [] },
    User: { plan: "FREE", companyName: "Me Ltd", bankIBAN: "DE00 1234" },
    ...overrides,
  } as unknown as InvoiceWithRelations;
}

const text = (buf: ArrayBuffer) => new TextDecoder().decode(buf);

beforeEach(() => {
  store.clear();
  renders.mockClear();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("renderInvoicePDF", () => {
  it("renders once and serves identical bytes for unchanged invoice data", async () => {
    const first = await renderInvoicePDF(invoice());
    const second = await renderInvoicePDF(invoice());

    expect(renders).toHaveBeenCalledTimes(1);
    expect(text(first)).toBe("%PDF-fake Invoice 1");
    expect(text(second)).toBe(text(first));
  });

  it("re-renders when the invoice itself changes", async () => {
    await renderInvoicePDF(invoice());
    const edited = await renderInvoicePDF(invoice({ invoiceName: "Invoice 1 (edited)" }));

    expect(renders).toHaveBeenCalledTimes(2);
    expect(text(edited)).toBe("%PDF-fake Invoice 1 (edited)");
  });

  it("re-renders when related data shown on the PDF changes", async () => {
    await renderInvoicePDF(invoice());
    // Bank details and the client's address live on other tables; the key
    // must cover them, not just the invoice row.
    await renderInvoicePDF(invoice({ User: { plan: "FREE", companyName: "Me Ltd", bankIBAN: "DE99 9999" } }));
    await renderInvoicePDF(
      invoice({ client: { name: "Acme", addresses: [{ street: "2 New St" }], contactPersons: [] } })
    );

    expect(renders).toHaveBeenCalledTimes(3);
  });

  it("re-renders when the owner's plan changes the branding level", async () => {
    await renderInvoicePDF(invoice());
    await renderInvoicePDF(invoice({ User: { plan: "BUSINESS", companyName: "Me Ltd", bankIBAN: "DE00 1234" } }));

    expect(renders).toHaveBeenCalledTimes(2);
    expect(renders.mock.calls[0][0].brandingLevel).toBe("SHOWN");
    expect(renders.mock.calls[1][0].brandingLevel).toBe("HIDDEN");
  });

  it("never serves one invoice's PDF for another", async () => {
    await renderInvoicePDF(invoice());
    const other = await renderInvoicePDF(invoice({ id: "inv-2", invoiceName: "Invoice 2" }));

    expect(text(other)).toBe("%PDF-fake Invoice 2");
  });
});
