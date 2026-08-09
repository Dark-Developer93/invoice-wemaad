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

import { EmailFooter } from "./EmailFooter";
import { EmailHeader } from "./EmailHeader";
import {
  button,
  buttonContainer,
  container,
  content,
  details,
  h3,
  main,
  text,
} from "./emailStyles";

interface InvoiceEmailTemplateProps {
  title: string;
  previewText: string;
  badge: { label: string; background: string; color: string };
  heading: string;
  notice: { text: string; background: string; borderColor: string };
  detailsHeading: string;
  bodyText: string;
  buttonText: string;
  clientName: string;
  invoiceNumber: string;
  invoiceDueDate: string;
  invoiceAmount: string;
  invoiceLink: string;
  brandingLevel: "SHOWN" | "MINIMAL" | "HIDDEN";
}

export function InvoiceEmailTemplate({
  title,
  previewText,
  badge,
  heading,
  notice,
  detailsHeading,
  bodyText,
  buttonText,
  clientName,
  invoiceNumber,
  invoiceDueDate,
  invoiceAmount,
  invoiceLink,
  brandingLevel,
}: InvoiceEmailTemplateProps) {

  const noticeStyle = {
    backgroundColor: notice.background,
    borderLeft: `4px solid ${notice.borderColor}`,
    padding: "16px",
    margin: "24px 0",
    borderRadius: "0 8px 8px 0",
  };

  return (
    <Html>
      <Head>
        <title>{title}</title>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader
            badgeLabel={badge.label}
            badgeBackground={badge.background}
            badgeColor={badge.color}
          />

          <div style={content}>
            <Heading as="h2">{heading}</Heading>

            <Text style={text}>Hello {clientName},</Text>

            <div style={noticeStyle}>
              <Text style={text}>{notice.text}</Text>
            </div>

            <div style={details}>
              <Heading as="h3" style={h3}>
                {detailsHeading}
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

            <Text style={text}>{bodyText}</Text>

            <div style={buttonContainer}>
              <Link href={invoiceLink} style={button}>
                {buttonText}
              </Link>
            </div>

            <EmailFooter brandingLevel={brandingLevel} />
          </div>
        </Container>
      </Body>
    </Html>
  );
}
