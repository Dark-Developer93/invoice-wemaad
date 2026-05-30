import { ReminderInvoiceEmailProps } from "@/types";
import { InvoiceEmailTemplate } from "../components/InvoiceEmailTemplate";

export default function ReminderInvoiceEmail({
  clientName,
  invoiceNumber,
  invoiceDueDate,
  invoiceAmount,
  invoiceLink,
}: ReminderInvoiceEmailProps) {
  return (
    <InvoiceEmailTemplate
      title="Invoice Reminder - InvoiceWeMaAd"
      previewText={`Payment Reminder for Invoice #${invoiceNumber}`}
      badge={{ label: "Payment Reminder", background: "#ffe4e6", color: "#be123c" }}
      heading="Invoice Payment Reminder"
      noticeText={`This is a friendly reminder that payment for invoice #${invoiceNumber} is due soon.`}
      noticeBackground="#ffe4e6"
      noticeBorderColor="#be123c"
      detailsHeading="Invoice Information"
      bodyText="Please ensure timely payment to avoid any late fees. You can view and pay your invoice by clicking the button below:"
      buttonText="View Invoice"
      clientName={clientName}
      invoiceNumber={invoiceNumber}
      invoiceDueDate={invoiceDueDate}
      invoiceAmount={invoiceAmount}
      invoiceLink={invoiceLink}
    />
  );
}
