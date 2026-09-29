import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/invoicePdf", () => ({
  loadInvoiceForPdf: vi.fn(),
  renderInvoicePDF: vi.fn(),
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import { auth } from "@/lib/auth";
import { loadInvoiceForPdf, renderInvoicePDF } from "@/lib/invoicePdf";
import { generateInvoicePDF } from "../generate-invoice";

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;
const mockLoadInvoice = vi.mocked(loadInvoiceForPdf);
const mockRenderPDF = vi.mocked(renderInvoicePDF);

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("generateInvoicePDF (server action)", () => {
  it("rejects callers without a session", async () => {
    mockAuth.mockResolvedValue(null);

    await expect(generateInvoicePDF("inv-1")).rejects.toThrow("Unauthorized");
    expect(mockLoadInvoice).not.toHaveBeenCalled();
  });

  it("scopes the lookup to the caller's own invoices", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    const invoice = { id: "inv-1" } as Awaited<ReturnType<typeof loadInvoiceForPdf>>;
    mockLoadInvoice.mockResolvedValue(invoice);
    mockRenderPDF.mockResolvedValue(new ArrayBuffer(8));

    await generateInvoicePDF("inv-1");

    expect(mockLoadInvoice).toHaveBeenCalledWith("inv-1", "user-1");
    expect(mockRenderPDF).toHaveBeenCalledWith(invoice);
  });

  // Regression: this action used to accept a `skipAuthCheck` argument. Server
  // action arguments are client-controlled, so any logged-in user could pass
  // `true` and download another user's invoice PDF.
  it("ignores extra client-supplied arguments and still enforces ownership", async () => {
    mockAuth.mockResolvedValue({ user: { id: "attacker" } });
    mockLoadInvoice.mockResolvedValue(null); // victim's invoice isn't the attacker's

    const callWithExtraArg = generateInvoicePDF as unknown as (id: string, skip: boolean) => Promise<ArrayBuffer>;
    await expect(callWithExtraArg("victim-invoice", true)).rejects.toThrow("Invoice not found");

    expect(mockLoadInvoice).toHaveBeenCalledWith("victim-invoice", "attacker");
    expect(mockRenderPDF).not.toHaveBeenCalled();
  });
});
