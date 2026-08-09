import { InvoiceEmailProps } from "@/types";
import { InvoiceEmailTemplate } from "../components/InvoiceEmailTemplate";

export default function UpdatedInvoiceEmail(props: InvoiceEmailProps) {
  return (
    <InvoiceEmailTemplate
      title="Invoice Updated - InvoiceWeMaAd"
      previewText={`Invoice #${props.invoiceNumber} has been updated`}
      badge={{ label: "Updated Invoice", background: "#fef3c7", color: "#b45309" }}
      heading="Invoice Updated"
      notice={{
        text: "Your invoice has been updated. Please review the changes below.",
        background: "#fef3c7",
        borderColor: "#b45309",
      }}
      detailsHeading="Updated Invoice Information"
      bodyText="You can view and download your updated invoice by clicking the button below:"
      buttonText="View Updated Invoice"
      clientName={props.clientName}
      invoiceNumber={props.invoiceNumber}
      invoiceDueDate={props.invoiceDueDate}
      invoiceAmount={props.invoiceAmount}
      invoiceLink={props.invoiceLink}
      showBranding={props.showBranding}
    />
  );
}
