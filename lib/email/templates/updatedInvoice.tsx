import { UpdatedInvoiceEmailProps } from "@/types";
import { InvoiceEmailProvider } from "../components/InvoiceEmailContext";
import { InvoiceEmailTemplate } from "../components/InvoiceEmailTemplate";

export default function UpdatedInvoiceEmail(props: UpdatedInvoiceEmailProps) {
  return (
    <InvoiceEmailProvider invoice={props}>
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
      />
    </InvoiceEmailProvider>
  );
}
