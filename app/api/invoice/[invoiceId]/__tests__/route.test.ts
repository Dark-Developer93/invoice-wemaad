import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import { NextRequest } from "next/server";

// ── Mocks ────────────────────────────────────────────────────────────────────
// vi.mock factories are hoisted above the file's top-level scope, so the
// secret is a literal here rather than a shared const (see AUTH_SECRET below).

vi.mock("@/lib/env", () => ({
  env: { AUTH_SECRET: "a".repeat(32) },
}));

vi.mock("@/lib/db", () => ({
  default: {
    invoice: { findUnique: vi.fn() },
  },
}));

vi.mock("@/app/actions/generate-invoice", () => ({
  generateInvoicePDF: vi.fn(),
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import prisma from "@/lib/db";
import { generateInvoicePDF } from "@/app/actions/generate-invoice";
import { GET } from "../route";

// ── Helpers ───────────────────────────────────────────────────────────────────

const db = prisma as unknown as {
  invoice: { findUnique: ReturnType<typeof vi.fn> };
};
const mockGeneratePDF = vi.mocked(generateInvoicePDF);

// Must match the literal used in the vi.mock("@/lib/env") factory above.
const AUTH_SECRET = "a".repeat(32);

// Same HMAC scheme as lib/urls.ts's hmacToken(), recomputed here so tests don't
// depend on real getInvoiceUrl()/verifyInvoiceToken() to prove the route wiring.
function tokenFor(invoiceId: string): string {
  return crypto.createHmac("sha256", AUTH_SECRET).update(invoiceId).digest("hex");
}

function makeRequest(invoiceId: string, token?: string): NextRequest {
  const url = new URL(`http://localhost/api/invoice/${invoiceId}`);
  if (token !== undefined) url.searchParams.set("token", token);
  return new NextRequest(url);
}

function callRoute(invoiceId: string, token?: string) {
  return GET(makeRequest(invoiceId, token), {
    params: Promise.resolve({ invoiceId }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("GET /api/invoice/[invoiceId]", () => {
  it("rejects a request with no token", async () => {
    const res = await callRoute("inv-1");

    expect(res.status).toBe(401);
    expect(db.invoice.findUnique).not.toHaveBeenCalled();
    expect(mockGeneratePDF).not.toHaveBeenCalled();
  });

  it("rejects a tampered token", async () => {
    const tampered = tokenFor("inv-1").slice(0, -4) + "0000";
    const res = await callRoute("inv-1", tampered);

    expect(res.status).toBe(401);
    expect(db.invoice.findUnique).not.toHaveBeenCalled();
  });

  it("rejects a valid token generated for a different invoice", async () => {
    const tokenForOtherInvoice = tokenFor("inv-OTHER");
    const res = await callRoute("inv-1", tokenForOtherInvoice);

    expect(res.status).toBe(401);
    expect(db.invoice.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when the token is valid but the invoice no longer exists", async () => {
    db.invoice.findUnique.mockResolvedValue(null);

    const res = await callRoute("inv-1", tokenFor("inv-1"));

    expect(res.status).toBe(404);
    expect(mockGeneratePDF).not.toHaveBeenCalled();
  });

  it("returns the PDF when the token is valid and the invoice exists", async () => {
    db.invoice.findUnique.mockResolvedValue({ id: "inv-1", invoiceName: "Invoice-1" });
    mockGeneratePDF.mockResolvedValue(new ArrayBuffer(8));

    const res = await callRoute("inv-1", tokenFor("inv-1"));

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    // skipAuthCheck=true: this route is the intentional no-login public share
    // link, gated on the HMAC token instead of a session.
    expect(mockGeneratePDF).toHaveBeenCalledWith("inv-1", true);
  });

  it("returns 500 and does not leak internals when the DB lookup throws", async () => {
    db.invoice.findUnique.mockRejectedValue(new Error("connection reset"));

    const res = await callRoute("inv-1", tokenFor("inv-1"));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ error: "Failed to generate invoice" });
  });
});
