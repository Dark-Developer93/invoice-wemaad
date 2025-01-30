import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

import { UpdatedInvoiceEmailProps } from "@/types";
export default function UpdatedInvoiceEmail({
  clientName,
  invoiceNumber,
  invoiceDueDate,
  invoiceAmount,
  invoiceLink,
}: UpdatedInvoiceEmailProps) {
  return (
    <Html>
      <Head>
        <title>Invoice Updated - InvoiceWeMaAd</title>
      </Head>
      <Preview>Invoice #{invoiceNumber} has been updated</Preview>
      <Body style={main}>
        <Container style={container}>
          <div style={header}>
            <div style={brand}>
              Invoice<span style={brandSpan}>WeMaAd</span>
            </div>
            <div style={warningBadge}>Updated Invoice</div>
          </div>

          <div style={content}>
            <Heading as="h2">Invoice Updated</Heading>

            <Text style={text}>Hello {clientName},</Text>

            <div style={warningNotice}>
              <Text style={text}>
                Your invoice has been updated. Please review the changes below.
              </Text>
            </div>

            <div style={details}>
              <Heading as="h3" style={h3}>
                Updated Invoice Information
              </Heading>
              <Text style={text}>
                <strong>Invoice Number:</strong> #{invoiceNumber}
              </Text>
              <Text style={text}>
                <strong>Due Date:</strong> {invoiceDueDate}
              </Text>
              <Text style={text}>
                <strong>Total Amount:</strong> {invoiceAmount}
              </Text>
            </div>

            <Text style={text}>
              You can view and download your updated invoice by clicking the
              button below:
            </Text>

            <div style={buttonContainer}>
              <Link href={invoiceLink} style={button}>
                View Updated Invoice
              </Link>
            </div>

            <div style={footer}>
              <Text style={{ ...text, color: "#71717a", fontSize: "14px" }}>
                © 2024 InvoiceWeMaAd. All rights reserved.
              </Text>
              <Text style={{ ...text, color: "#71717a", fontSize: "14px" }}>
                Making invoicing super easy!
              </Text>
            </div>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  fontFamily: '"Geist", Arial, sans-serif',
  lineHeight: 1.6,
  color: "#09090b",
  backgroundColor: "#fafafa",
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "32px 24px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};

const header = {
  textAlign: "left" as const,
  marginBottom: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const brand = {
  fontSize: "24px",
  fontWeight: 600,
  color: "#18181b",
};

const brandSpan = {
  color: "#3b82f6",
};

const warningBadge = {
  display: "inline-block",
  padding: "6px 12px",
  backgroundColor: "#fef3c7",
  color: "#b45309",
  borderRadius: "9999px",
  fontSize: "14px",
  fontWeight: 500,
};

const content = {
  padding: "0 16px",
};

const details = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const h3 = {
  margin: "0 0 12px 0",
  color: "#18181b",
  fontSize: "16px",
};

const text = {
  margin: "16px 0",
  color: "#09090b",
  fontSize: "16px",
};

const warningNotice = {
  backgroundColor: "#fef3c7",
  borderLeft: "4px solid #b45309",
  padding: "16px",
  margin: "24px 0",
  borderRadius: "0 8px 8px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  fontWeight: 500,
};

const footer = {
  marginTop: "48px",
  textAlign: "center" as const,
};
