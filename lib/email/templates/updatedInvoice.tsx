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
import { EmailFooter } from "../components/EmailFooter";
import { EmailHeader } from "../components/EmailHeader";
import {
  button,
  buttonContainer,
  container,
  content,
  details,
  h3,
  main,
  text,
} from "../components/emailStyles";

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
          <EmailHeader
            badgeLabel="Updated Invoice"
            badgeBackground="#fef3c7"
            badgeColor="#b45309"
          />

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

            <EmailFooter />
          </div>
        </Container>
      </Body>
    </Html>
  );
}

const warningNotice = {
  backgroundColor: "#fef3c7",
  borderLeft: "4px solid #b45309",
  padding: "16px",
  margin: "24px 0",
  borderRadius: "0 8px 8px 0",
};
