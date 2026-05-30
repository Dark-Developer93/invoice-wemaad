import { NewInvoiceEmailProps } from "@/types";
import { InvoiceEmailTemplate } from "../components/InvoiceEmailTemplate";

export default function NewInvoiceEmail({
  clientName,
  invoiceNumber,
  invoiceDueDate,
  invoiceAmount,
  invoiceLink,
}: NewInvoiceEmailProps) {
  return (
    <InvoiceEmailTemplate
      title="New Invoice - InvoiceWeMaAd"
      previewText={`New Invoice #${invoiceNumber} for ${clientName}`}
      badge={{ label: "New Invoice", background: "#dbeafe", color: "#1d4ed8" }}
      heading="New Invoice"
      noticeText="A new invoice has been generated for your recent services. Please find the details below."
      noticeBackground="#eff6ff"
      noticeBorderColor="#3b82f6"
      detailsHeading="Invoice Information"
      bodyText="You can view and download your invoice by clicking the button below:"
      buttonText="View Invoice"
      clientName={clientName}
      invoiceNumber={invoiceNumber}
      invoiceDueDate={invoiceDueDate}
      invoiceAmount={invoiceAmount}
      invoiceLink={invoiceLink}
    />
  );
}
