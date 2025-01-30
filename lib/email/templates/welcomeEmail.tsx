import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface WelcomeEmailProps {
  url: string;
}

export default function WelcomeEmail({ url }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to InvoiceWeMaAd - Your Magic Link is Here!</Preview>
      <Body style={main}>
        <Container style={container}>
          <div style={header}>
            <div style={brand}>
              Invoice<span style={brandSpan}>WeMaAd</span>
            </div>
            <div style={badge}>Magic Link</div>
          </div>

          <Section style={content}>
            <Heading style={heroText}>Welcome to InvoiceWeMaAd!</Heading>

            <Text>Hello there,</Text>

            <Text>
              Thank you for choosing InvoiceWeMaAd. To access your account,
              simply click the secure login button below:
            </Text>

            <Section style={magicLinkBox}>
              <Text>Your secure login link is ready</Text>
              <Button style={button} href={url}>
                Sign in to InvoiceWeMaAd
              </Button>
              <Text style={{ fontSize: "14px", color: "#64748B" }}>
                This link will expire in 24 hours
              </Text>
            </Section>

            <div style={notice}>
              <Text style={{ margin: 0 }}>
                <strong>Security Notice:</strong> If you didn&apos;t request
                this email, please ignore it. Your account security is important
                to us.
              </Text>
            </div>

            <div style={features}>
              <div style={feature}>
                <div style={featureTitle}>📊 Dashboard Analytics</div>
                <Text style={{ margin: 0 }}>
                  Track your invoices and payments in real-time
                </Text>
              </div>
              <div style={feature}>
                <div style={featureTitle}>💰 Invoice Management</div>
                <Text style={{ margin: 0 }}>
                  Create and manage professional invoices easily
                </Text>
              </div>
            </div>

            <div style={footer}>
              <Text>© 2024 InvoiceWeMaAd. All rights reserved.</Text>
              <Text>Making invoicing super easy!</Text>
            </div>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#FAFAFA",
  fontFamily: '"Geist", Arial, sans-serif',
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "24px",
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};

const header = {
  textAlign: "left" as const,
  marginBottom: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 16px",
};

const brand = {
  display: "inline-flex",
  alignItems: "center",
  fontSize: "24px",
  fontWeight: 600,
  color: "#18181B",
};

const brandSpan = {
  color: "#3B82F6",
  marginLeft: "4px",
};

const badge = {
  display: "inline-block",
  padding: "6px 12px",
  backgroundColor: "#ECFDF5",
  color: "#059669",
  borderRadius: "9999px",
  fontSize: "14px",
  fontWeight: 500,
  marginLeft: "8px",
};

const content = {
  padding: "0 16px",
};

const heroText = {
  fontSize: "32px",
  fontWeight: 600,
  margin: "24px 0",
  background: "linear-gradient(to right, #3B82F6, #14B8A6, #22C55E)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const magicLinkBox = {
  backgroundColor: "#F8FAFC",
  border: "1px solid #E2E8F0",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const button = {
  display: "inline-block",
  padding: "12px 32px",
  background: "linear-gradient(to right, #3B82F6, #14B8A6, #22C55E)",
  color: "#FFFFFF",
  textDecoration: "none",
  borderRadius: "6px",
  fontWeight: 500,
  margin: "16px 0",
  textAlign: "center" as const,
};

const notice = {
  backgroundColor: "#FEF3C7",
  borderLeft: "4px solid #D97706",
  padding: "16px",
  margin: "24px 0",
  borderRadius: "0 8px 8px 0",
  fontSize: "14px",
};

const features = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "16px",
  margin: "32px 0",
};

const feature = {
  padding: "16px",
  backgroundColor: "#F8FAFC",
  borderRadius: "8px",
};

const featureTitle = {
  fontWeight: 600,
  marginBottom: "8px",
  color: "#18181B",
};

const footer = {
  marginTop: "48px",
  textAlign: "center" as const,
  color: "#71717A",
  fontSize: "14px",
  borderTop: "1px solid #E4E4E7",
  paddingTop: "24px",
};
