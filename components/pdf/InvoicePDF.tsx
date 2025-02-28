import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/formatCurrency";
import { Currency } from "@/types";
import { InvoiceWithRelations } from "@/app/actions/generate-invoice";

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  topBorder: {
    borderTopWidth: 0.5,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    alignItems: "flex-start",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    width: 500,
    height: 100,
    marginRight: 10,
    objectFit: "contain",
    objectPosition: "left",
  },
  headerText: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  invoiceText: {
    fontSize: 32,
    color: "#111827",
    marginRight: 5,
  },
  companyName: {
    fontSize: 28,
    color: "#2563EB",
  },
  statusBadge: {
    padding: "4 12",
    borderRadius: 4,
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    minWidth: 80,
  },
  statusPaid: {
    backgroundColor: "#D1FAE5",
    color: "#10B981",
  },
  statusPending: {
    backgroundColor: "#DBEAFE",
    color: "#2563EB",
  },
  infoBox: {
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 3,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  infoLabel: {
    color: "#6B7280",
    fontSize: 11,
    width: 100,
  },
  infoValue: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "bold",
  },
  section: {
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 3,
    marginBottom: 10,
    flex: 1,
  },
  sectionsContainer: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  sectionContent: {
    color: "#374151",
    fontSize: 11,
    marginBottom: 4,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    padding: "6 15",
    borderRadius: 3,
  },
  tableHeaderCell: {
    color: "#1F2937",
    fontSize: 11,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    padding: "10 15",
    marginTop: 5,
    borderRadius: 3,
  },
  descriptionCell: {
    flex: 1,
  },
  qtyCell: {
    width: 60,
    textAlign: "right",
  },
  rateCell: {
    width: 80,
    textAlign: "right",
  },
  amountCell: {
    width: 80,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    padding: "10 15",
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
    marginRight: 10,
  },
  totalAmount: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  bankDetails: {
    marginTop: 20,
    marginBottom: 60,
    width: "60%",
  },
  paymentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 20,
    marginBottom: 60,
  },
  stampSection: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  stamp: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  bankLabel: {
    color: "#374151",
    fontSize: 11,
    width: 100,
  },
  bankValue: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "bold",
    flex: 1,
  },
  bankRow: {
    flexDirection: "row",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 0.5,
    borderColor: "#E5E7EB",
    paddingTop: 10,
  },
  footerText: {
    color: "#9CA3AF",
    fontSize: 8,
  },
});

export function InvoicePDF({ invoice }: { invoice: InvoiceWithRelations }) {
  const invoiceDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(new Date(invoice.date));

  const dueDate = new Date(invoice.date);
  dueDate.setDate(dueDate.getDate() + (invoice.dueDate || 30));
  const formattedDueDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(dueDate);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBorder} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {invoice.User?.companyLogoUrl ? (
              <Image style={styles.logo} src={invoice.User.companyLogoUrl} />
            ) : (
              <View style={styles.headerText}>
                <Text style={styles.invoiceText}>Invoice</Text>
                <Text style={styles.companyName}>WeMaAd</Text>
              </View>
            )}
          </View>
          <View
            style={[
              styles.statusBadge,
              invoice.status === "PAID"
                ? styles.statusPaid
                : styles.statusPending,
            ]}
          >
            <Text>{invoice.status}</Text>
          </View>
        </View>

        {/* Invoice Info */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Invoice Number:</Text>
            <Text style={styles.infoValue}>#{invoice.invoiceNumber}</Text>
          </View>
          {invoice.User?.companyTaxId && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tax ID:</Text>
              <Text style={styles.infoValue}>{invoice.User.companyTaxId}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Invoice Date:</Text>
            <Text style={styles.infoValue}>{invoiceDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Due Date:</Text>
            <Text style={styles.infoValue}>{formattedDueDate}</Text>
          </View>
        </View>

        {/* From and To Sections */}
        <View style={styles.sectionsContainer}>
          {/* From Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>From</Text>
            <Text style={styles.sectionContent}>
              {invoice.User?.companyName}
            </Text>
            <Text style={styles.sectionContent}>
              {invoice.User?.companyEmail}
            </Text>
            <Text style={styles.sectionContent}>
              {invoice.User?.companyAddress}
            </Text>
          </View>

          {/* To Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>To</Text>
            <Text style={styles.sectionContent}>{invoice.client?.name}</Text>
            <Text style={styles.sectionContent}>
              {invoice.client?.contactPersons?.[0]?.email}
            </Text>
            {invoice.client?.addresses?.[0] && (
              <Text style={styles.sectionContent}>
                {[
                  invoice.client.addresses[0].street,
                  `${invoice.client.addresses[0].city || ""}, ${
                    invoice.client.addresses[0].state || ""
                  }`,
                  `${invoice.client.addresses[0].country || ""} ${
                    invoice.client.addresses[0].zipCode || ""
                  }`,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            )}
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.descriptionCell]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderCell, styles.qtyCell]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.rateCell]}>Rate</Text>
            <Text style={[styles.tableHeaderCell, styles.amountCell]}>
              Amount
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.sectionContent, styles.descriptionCell]}>
              {invoice.invoiceItemDescription}
            </Text>
            <Text style={[styles.sectionContent, styles.qtyCell]}>
              {invoice.invoiceItemQuantity}
            </Text>
            <Text style={[styles.sectionContent, styles.rateCell]}>
              {formatCurrency({
                amount: invoice.invoiceItemRate,
                currency: invoice.currency as Currency,
              })}
            </Text>
            <Text style={[styles.sectionContent, styles.amountCell]}>
              {formatCurrency({
                amount: invoice.total,
                currency: invoice.currency as Currency,
              })}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency({
                amount: invoice.total,
                currency: invoice.currency as Currency,
              })}
            </Text>
          </View>
        </View>

        {/* Payment Details and Stamp Container */}
        <View style={styles.paymentContainer}>
          {/* Bank Details */}
          {invoice.User && (
            <View style={[styles.section, { flex: 1, marginRight: 20 }]}>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              {invoice.User.bankName && (
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>Bank Name: </Text>
                  <Text style={styles.bankValue}>{invoice.User.bankName}</Text>
                </View>
              )}
              {invoice.User.bankAccountName && (
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>Account Name: </Text>
                  <Text style={styles.bankValue}>
                    {invoice.User.bankAccountName}
                  </Text>
                </View>
              )}
              {invoice.User.bankAccountNumber && (
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>Account No.: </Text>
                  <Text style={styles.bankValue}>
                    {invoice.User.bankAccountNumber}
                  </Text>
                </View>
              )}
              {invoice.User.bankSwiftCode && (
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>Swift Code: </Text>
                  <Text style={styles.bankValue}>
                    {invoice.User.bankSwiftCode}
                  </Text>
                </View>
              )}
              {invoice.User.bankIBAN && (
                <View style={styles.bankRow}>
                  <Text style={styles.bankLabel}>IBAN: </Text>
                  <Text style={styles.bankValue}>{invoice.User.bankIBAN}</Text>
                </View>
              )}
            </View>
          )}

          {/* Stamp Section */}
          {invoice.User?.stampsUrl && (
            <View style={styles.stampSection}>
              <Image style={styles.stamp} src={invoice.User.stampsUrl} />
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} InvoiceWeMaAd. All rights reserved.
          </Text>
          <Text style={styles.footerText}>Making invoicing super easy!</Text>
        </View>
      </Page>
    </Document>
  );
}
