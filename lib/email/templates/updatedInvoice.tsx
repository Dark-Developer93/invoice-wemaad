import { UpdatedInvoiceEmailProps } from "@/types";
import { InvoiceEmailTemplate } from "../components/InvoiceEmailTemplate";

export default function UpdatedInvoiceEmail({
  clientName,
  invoiceNumber,
  invoiceDueDate,
  invoiceAmount,
  invoiceLink,
}: UpdatedInvoiceEmailProps) {
  return (
    <InvoiceEmailTemplate
      title="Invoice Updated - InvoiceWeMaAd"
      previewText={`Invoice #${invoiceNumber} has been updated`}
      badge={{ label: "Updated Invoice", background: "#fef3c7", color: "#b45309" }}
      heading="Invoice Updated"
      noticeText="Your invoice has been updated. Please review the changes below."
      noticeBackground="#fef3c7"
      noticeBorderColor="#b45309"
      detailsHeading="Updated Invoice Information"
      bodyText="You can view and download your updated invoice by clicking the button below:"
      buttonText="View Updated Invoice"
      clientName={clientName}
      invoiceNumber={invoiceNumber}
      invoiceDueDate={invoiceDueDate}
      invoiceAmount={invoiceAmount}
      invoiceLink={invoiceLink}
    />
  );
}
