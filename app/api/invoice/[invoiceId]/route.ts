import { NextResponse } from "next/server";
import jsPDF from "jspdf";

import prisma from "@/lib/db";
import { formatCurrency } from "@/lib/formatCurrency";
import { Currency } from "@/types";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ invoiceId: string }>;
  }
) {
  const { invoiceId } = await params;

  const data = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    select: {
      invoiceName: true,
      invoiceNumber: true,
      currency: true,
      fromName: true,
      fromEmail: true,
      fromAddress: true,
      clientName: true,
      clientAddress: true,
      clientEmail: true,
      date: true,
      dueDate: true,
      invoiceItemDescription: true,
      invoiceItemQuantity: true,
      invoiceItemRate: true,
      total: true,
      note: true,
      status: true,
    },
  });

  if (!data) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Set font
  pdf.setFont("helvetica");

  // Add subtle top border
  pdf.setDrawColor(229, 231, 235); // #E5E7EB
  pdf.setLineWidth(0.5);
  pdf.line(20, 20, 190, 20);

  // Header section with refined spacing
  pdf.setFontSize(32);
  pdf.setTextColor(17, 24, 39); // Darker gray
  const invoiceWidth = pdf.getTextWidth("Invoice");
  pdf.text("Invoice", 20, 40);

  pdf.setTextColor(37, 99, 235); // Better blue
  pdf.setFontSize(28);
  pdf.text("WeMaAd", 20 + invoiceWidth, 40); // Added 5mm spacing between words

  // Status badge with refined styling
  pdf.setFontSize(12);
  if (data.status === "PAID") {
    pdf.setFillColor(209, 250, 229); // Light green bg
    pdf.setTextColor(16, 185, 129); // Green text
  } else {
    pdf.setFillColor(219, 234, 254); // Light blue bg
    pdf.setTextColor(37, 99, 235); // Blue text
  }
  pdf.roundedRect(150, 30, 40, 10, 4, 4, "F");
  pdf.text(data.status, 160, 37);

  // Create a larger box for all invoice details
  pdf.setFillColor(249, 250, 251);
  pdf.roundedRect(20, 60, 170, 30, 3, 3, "F"); // Extended width to 170mm and starts from left margin

  // Format dates
  const invoiceDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(data.date);

  const dueDate = data.dueDate === 0 ? invoiceDate : `Net ${data.dueDate}`;

  // Add all invoice details with consistent styling
  pdf.setFontSize(11);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`Invoice Title: ${data.invoiceName}`, 25, 70); // Adjusted x position to 25
  pdf.text(`Invoice No.: #${data.invoiceNumber}`, 25, 75); // Adjusted x position to 25
  pdf.text(`Invoice Date: ${invoiceDate}`, 25, 80); // Adjusted x position to 25
  pdf.text(`Due Date: ${dueDate}`, 25, 85); // Adjusted x position to 25

  // Billing sections with enhanced styling
  pdf.setFillColor(249, 250, 251); // Lighter gray background

  // From section with text wrapping and better spacing
  pdf.roundedRect(20, 100, 80, 55, 3, 3, "F");
  pdf.setTextColor(17, 24, 39);
  pdf.setFontSize(13);
  pdf.text("From", 25, 110);
  pdf.setFontSize(11);
  pdf.setTextColor(55, 65, 81);
  const fromLines = [data.fromName, data.fromEmail];
  // Split address into multiple lines if needed
  const wrappedAddress = pdf.splitTextToSize(data.fromAddress, 70);
  pdf.text(fromLines, 25, 122);
  pdf.text(wrappedAddress, 25, 135);

  // To section with lighter background
  pdf.setFillColor(249, 250, 251);
  pdf.roundedRect(110, 100, 80, 55, 3, 3, "F");
  pdf.setTextColor(17, 24, 39);
  pdf.setFontSize(13);
  pdf.text("To", 115, 110);
  pdf.setFontSize(11);
  pdf.setTextColor(55, 65, 81);
  const toLines = [data.clientName, data.clientEmail];
  // Split address into multiple lines if needed
  const wrappedClientAddress = pdf.splitTextToSize(data.clientAddress, 70);
  pdf.text(toLines, 115, 122);
  pdf.text(wrappedClientAddress, 115, 135);

  // // Date and payment information
  // pdf.setTextColor(75, 85, 99);
  // pdf.setFontSize(10);

  // const invoiceDate = new Intl.DateTimeFormat("en-US", {
  //   dateStyle: "long",
  // }).format(data.date);

  // // Format due date based on dueDate value
  // const dueDate =
  //   data.dueDate === 0
  //     ? invoiceDate // If dueDate is 0, use invoice date
  //     : `Net ${data.dueDate}`; // Otherwise show Net X

  // pdf.text(`Invoice Date: ${invoiceDate}`, 20, 155);
  // pdf.text(`Due Date: ${dueDate}`, 20, 162);

  // Table header with modern styling
  pdf.setFillColor(249, 250, 251);
  pdf.rect(20, 170, 170, 12, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(31, 41, 55);
  pdf.text("Description", 25, 178);
  pdf.text("Qty", 120, 178);
  pdf.text("Rate", 145, 178);
  pdf.text("Amount", 170, 178);

  // Table content with proper text wrapping and alignment
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(75, 85, 99);

  // Wrap description text to prevent overlapping
  const wrappedDescription = pdf.splitTextToSize(
    data.invoiceItemDescription,
    90
  ); // Limit width to 90mm
  pdf.text(wrappedDescription, 25, 190);

  // Adjust vertical position for numbers based on description height
  const lineHeight = 7; // Height per line in mm
  const lastLineY = 190 + (wrappedDescription.length - 1) * lineHeight;

  // Right align quantity
  const qtyText = data.invoiceItemQuantity.toString();
  pdf.text(qtyText, 130 - pdf.getTextWidth(qtyText), lastLineY);

  // Right align rate
  const rateText = formatCurrency({
    amount: data.invoiceItemRate,
    currency: data.currency as Currency,
  });
  pdf.text(rateText, 160 - pdf.getTextWidth(rateText), lastLineY);

  // Right align amount
  const amountText = formatCurrency({
    amount: data.total,
    currency: data.currency as Currency,
  });
  pdf.text(amountText, 185 - pdf.getTextWidth(amountText), lastLineY);

  // Total section with enhanced styling
  pdf.setFillColor(243, 244, 246);
  pdf.roundedRect(110, 210, 80, 40, 4, 4, "F");
  pdf.setTextColor(17, 24, 39);
  pdf.setFontSize(12);
  pdf.text("Total", 115, 225);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text(
    formatCurrency({
      amount: data.total,
      currency: data.currency as Currency,
    }),
    115,
    240
  );

  // Add automated invoice notice before footer
  pdf.setTextColor(107, 114, 128); // Gray color
  pdf.setFontSize(10);
  pdf.text(
    "This is an automated invoice - No stamp or signature required",
    20,
    265
  );

  // Footer with subtle styling
  pdf.setTextColor(156, 163, 175); // #9CA3AF
  pdf.setFontSize(8);
  pdf.text("© 2024 InvoiceWeMaAd. All rights reserved.", 20, 280);
  pdf.text("Making invoicing super easy!", 20, 285);

  // Add subtle bottom border
  pdf.setDrawColor(229, 231, 235);
  pdf.line(20, 275, 190, 275);

  const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${data.invoiceName}.pdf"`,
    },
  });
}
