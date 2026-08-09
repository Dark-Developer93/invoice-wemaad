import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { pdf } from "@react-pdf/renderer";
import { PDFParse } from "pdf-parse";
import { InvoicePDF } from "../InvoicePDF";
import type { InvoiceWithRelations } from "@/app/actions/generate-invoice";

// A 1x1 PNG, just enough for @react-pdf/renderer's Image element to
// resolve without a network fetch.
const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

function makeInvoice(overrides: Partial<InvoiceWithRelations> = {}): InvoiceWithRelations {
  return {
    id: "invoice-1",
    invoiceName: "Test Invoice",
    total: 150 as unknown as InvoiceWithRelations["total"],
    status: "PAID",
    date: new Date("2026-05-14"),
    dueDate: 30,
    fromName: "WeMaAd",
    fromEmail: "abdullah@wemaad.net",
    fromAddress: "3, Makram Ebeid",
    currency: "USD",
    invoiceNumber: 82,
    invoiceNote: null,
    items: [
      {
        description: "Yearly renewal of the domain balqees.org, including the Advanced Security Renewal feature",
        quantity: 3,
        rate: 30,
      },
      { description: "Google workspaces annual subscriptions fees", quantity: 12, rate: 5 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user-1",
    clientId: "client-1",
    recurringInvoiceId: null,
    client: {
      id: "client-1",
      name: "Balqees Organization",
      email: "tnagi@balqees.org",
      phone: null,
      taxId: null,
      website: null,
      notes: null,
      tags: [],
      category: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: "user-1",
      addresses: [
        {
          id: "addr-1",
          type: "BILLING",
          street: "Ard Elwa",
          city: "Cairo",
          state: "Giza",
          country: "Egypt",
          zipCode: "12554",
          isDefault: true,
          clientId: "client-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      contactPersons: [
        {
          id: "contact-1",
          firstName: "T",
          lastName: "Nagi",
          email: "tnagi@balqees.org",
          phone: null,
          position: null,
          isPrimary: true,
          clientId: "client-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    User: {
      plan: "BUSINESS",
      companyName: "WeMaAd for Technical and Software Solutions",
      companyEmail: "abdullah@wemaad.net",
      companyAddress: "3, Makram Ebeid, Al Mintaqah as Sadisah, Nasr City, Cairo Governorate, Egypt",
      companyTaxId: "768-340-888",
      companyLogoUrl: TINY_PNG,
      stampsUrl: TINY_PNG,
      bankName: "QNB",
      bankAccountName: "WeMaAd for Technical Solutions and Programming",
      bankAccountNumber: "20316715490",
      bankSwiftCode: "QNBAEGCXXXX",
      bankIBAN: "EG650037012084020316715490009",
      bankAddress: null,
    },
    ...overrides,
  } as unknown as InvoiceWithRelations;
}

async function renderToPages(invoice: InvoiceWithRelations, brandingLevel: "SHOWN" | "MINIMAL" | "HIDDEN") {
  // InvoicePDF renders a <Document> at runtime, but pdf()'s type only
  // accepts ReactElement<DocumentProps> directly — TS can't see through a
  // custom component's return type to verify that, so this cast is
  // asserting a fact the type system has no way to check on its own.
  const element = createElement(InvoicePDF, { invoice, brandingLevel }) as Parameters<typeof pdf>[0];
  const doc = await pdf(element);
  const buffer = Buffer.from(await (await doc.toBlob()).arrayBuffer());
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.pages.map((p) => p.text);
}

describe("InvoicePDF pagination", () => {
  // Regression test for a reported bug: a 2-item invoice (one item with a
  // long, wrapping description) with a company logo, a stamp, and full
  // bank details had its Payment Details box and stamp pushed to a wasted
  // page 2, despite free space remaining on page 1. Root cause was the
  // footer not being marked `fixed` (so it double-counted against the
  // page's flow-height budget on top of a manual marginBottom reserving
  // the same space) plus an oversized fixed-height logo/stamp box. See
  // the commit that introduced this test for the full writeup.
  it("fits a 2-item invoice with logo, stamp, and full bank details on a single page", async () => {
    // SHOWN specifically — this is what the original bug report actually
    // hit: the footer text itself (present at SHOWN/MINIMAL, absent at
    // HIDDEN) was part of what over-reserved page space. A HIDDEN-branding
    // invoice with this exact fixture already fit even before the fix, so
    // it wouldn't have caught the regression.
    const pages = await renderToPages(makeInvoice(), "SHOWN");

    expect(pages).toHaveLength(1);
    expect(pages[0]).toContain("Bank Name:");
    expect(pages[0]).toContain("Swift Code:");
    expect(pages[0]).toContain("IBAN:");
  });

  it("still paginates a genuinely long invoice, moving the payment block as one unit", async () => {
    const manyItems = Array.from({ length: 20 }, (_, i) => ({
      description: `Line item number ${i + 1} with a reasonably long description text`,
      quantity: i + 1,
      rate: 10 + i,
    }));
    const pages = await renderToPages(makeInvoice({ items: manyItems } as never), "HIDDEN");

    expect(pages.length).toBeGreaterThan(1);

    // The bank-details box must never split across pages — either every
    // field is on the same page, or none of them are (still to come).
    const bankFieldPages = pages.filter((text) => text.includes("Bank Name:"));
    for (const pageText of bankFieldPages) {
      expect(pageText).toContain("Swift Code:");
      expect(pageText).toContain("IBAN:");
    }
  });
});

describe("InvoicePDF branding footer", () => {
  it("SHOWN renders the full growth-loop CTA with a link", async () => {
    const pages = await renderToPages(makeInvoice(), "SHOWN");
    expect(pages.join("\n")).toContain("Sent with");
  });

  it("MINIMAL renders a small unlinked credit only", async () => {
    const pages = await renderToPages(makeInvoice(), "MINIMAL");
    const text = pages.join("\n");
    expect(text).toContain("Powered by InvoiceWeMaAd");
    expect(text).not.toContain("Sent with");
  });

  it("HIDDEN renders no footer at all", async () => {
    const pages = await renderToPages(makeInvoice(), "HIDDEN");
    const text = pages.join("\n");
    expect(text).not.toContain("Sent with");
    expect(text).not.toContain("Powered by InvoiceWeMaAd");
  });
});
