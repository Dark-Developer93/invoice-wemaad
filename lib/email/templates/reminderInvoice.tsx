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

import { ReminderInvoiceEmailProps } from "@/types";

export default function ReminderInvoiceEmail({
  clientName,
  invoiceNumber,
  invoiceDueDate,
  invoiceAmount,
  invoiceLink,
}: ReminderInvoiceEmailProps) {
  return (
    <Html>
      <Head>
        <title>Invoice Reminder - InvoiceWeMaAd</title>
      </Head>
      <Preview>Payment Reminder for Invoice #{invoiceNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <div style={header}>
            <div style={brand}>
              Invoice<span style={brandSpan}>WeMaAd</span>
            </div>
            <div style={urgentBadge}>Payment Reminder</div>
          </div>

          <div style={content}>
            <Heading as="h2">Invoice Payment Reminder</Heading>

            <Text style={text}>Hello {clientName},</Text>

            <div style={urgentNotice}>
              <Text style={text}>
                This is a friendly reminder that payment for invoice #
                {invoiceNumber} is due soon.
              </Text>
            </div>

            <div style={details}>
              <Heading as="h3" style={h3}>
                Invoice Information
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
              Please ensure timely payment to avoid any late fees. You can view
              and pay your invoice by clicking the button below:
            </Text>

            <div style={buttonContainer}>
              <Link href={invoiceLink} style={button}>
                View Invoice
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

const urgentBadge = {
  display: "inline-block",
  padding: "6px 12px",
  backgroundColor: "#ffe4e6",
  color: "#be123c",
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

const urgentNotice = {
  backgroundColor: "#ffe4e6",
  borderLeft: "4px solid #be123c",
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
