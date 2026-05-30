import { NewInvoiceEmailProps } from "@/types";
import { InvoiceEmailProvider } from "../components/InvoiceEmailContext";
import { InvoiceEmailTemplate } from "../components/InvoiceEmailTemplate";

export default function NewInvoiceEmail(props: NewInvoiceEmailProps) {
  return (
    <InvoiceEmailProvider invoice={props}>
      <InvoiceEmailTemplate
        title="New Invoice - InvoiceWeMaAd"
        previewText={`New Invoice #${props.invoiceNumber} for ${props.clientName}`}
        badge={{ label: "New Invoice", background: "#dbeafe", color: "#1d4ed8" }}
        heading="New Invoice"
        notice={{
          text: "A new invoice has been generated for your recent services. Please find the details below.",
          background: "#eff6ff",
          borderColor: "#3b82f6",
        }}
        detailsHeading="Invoice Information"
        bodyText="You can view and download your invoice by clicking the button below:"
        buttonText="View Invoice"
      />
    </InvoiceEmailProvider>
  );
}
