import { Text } from "@react-email/components";

const footer = {
  marginTop: "48px",
  textAlign: "center" as const,
  borderTop: "1px solid #e4e4e7",
  paddingTop: "24px",
};

const footerText = {
  margin: "4px 0",
  color: "#71717a",
  fontSize: "14px",
};

export function EmailFooter() {
  return (
    <div style={footer}>
      <Text style={footerText}>
        © {new Date().getFullYear()} InvoiceWeMaAd. All rights reserved.
      </Text>
      <Text style={footerText}>Making invoicing super easy!</Text>
    </div>
  );
}
