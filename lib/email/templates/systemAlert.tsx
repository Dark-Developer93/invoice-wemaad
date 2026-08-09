import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

import { SystemAlertEmailProps } from "@/types";
import { PlainEmailFooter } from "../components/EmailFooter";
import { EmailHeader } from "../components/EmailHeader";
import { container, content, details, main, text } from "../components/emailStyles";
import { getBaseUrl } from "@/lib/urls";

export default function SystemAlertEmail({
  title,
  message,
  href,
}: SystemAlertEmailProps) {
  return (
    <Html>
      <Head>
        <title>{title} - InvoiceWeMaAd</title>
      </Head>
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader
            badgeLabel="System Alert"
            badgeBackground="#fee2e2"
            badgeColor="#b91c1c"
          />

          <div style={content}>
            <Heading as="h2">{title}</Heading>

            <div style={notice}>
              <Text style={text}>{message}</Text>
            </div>

            {href && (
              <div style={details}>
                <Hr style={hr} />
                <Text style={text}>
                  <Link href={`${getBaseUrl()}${href}`}>View in admin panel</Link>
                </Text>
              </div>
            )}

            <PlainEmailFooter />
          </div>
        </Container>
      </Body>
    </Html>
  );
}

const notice = {
  backgroundColor: "#fef2f2",
  borderLeft: "4px solid #ef4444",
  padding: "16px",
  margin: "24px 0",
  borderRadius: "0 8px 8px 0",
};

const hr = {
  margin: "20px 0",
  borderColor: "#e4e4e7",
};
