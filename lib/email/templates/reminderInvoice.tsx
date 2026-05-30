import { InvoiceEmailProps } from "@/types";
import { InvoiceEmailTemplate } from "../components/InvoiceEmailTemplate";

export default function ReminderInvoiceEmail(props: InvoiceEmailProps) {
  return (
    <InvoiceEmailTemplate
      title="Invoice Reminder - InvoiceWeMaAd"
      previewText={`Payment Reminder for Invoice #${props.invoiceNumber}`}
      badge={{ label: "Payment Reminder", background: "#ffe4e6", color: "#be123c" }}
      heading="Invoice Payment Reminder"
      notice={{
        text: `This is a friendly reminder that payment for invoice #${props.invoiceNumber} is due soon.`,
        background: "#ffe4e6",
        borderColor: "#be123c",
      }}
      detailsHeading="Invoice Information"
      bodyText="Please ensure timely payment to avoid any late fees. You can view and pay your invoice by clicking the button below:"
      buttonText="View Invoice"
      clientName={props.clientName}
      invoiceNumber={props.invoiceNumber}
      invoiceDueDate={props.invoiceDueDate}
      invoiceAmount={props.invoiceAmount}
      invoiceLink={props.invoiceLink}
    />
  );
}
