-- Store money as fixed-precision DECIMAL instead of floating-point DOUBLE PRECISION
-- to remove rounding-drift risk on invoice totals.
ALTER TABLE "Invoice"
  ALTER COLUMN "total" TYPE DECIMAL(12,2) USING ROUND("total"::numeric, 2);

ALTER TABLE "RecurringInvoice"
  ALTER COLUMN "total" TYPE DECIMAL(12,2) USING ROUND("total"::numeric, 2);

-- Prevent duplicate invoice numbers for the same user (previously unenforced,
-- relying only on application-level sequencing).
-- NOTE: if any user already has duplicate invoiceNumber values, this migration
-- will fail — resolve the duplicates manually before deploying.
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_invoiceNumber_key" UNIQUE ("userId", "invoiceNumber");

-- Indexes on foreign keys / filter columns used by nearly every dashboard,
-- list, and report query.
CREATE INDEX "Invoice_userId_idx" ON "Invoice"("userId");
CREATE INDEX "Invoice_clientId_idx" ON "Invoice"("clientId");
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");
CREATE INDEX "RecurringInvoice_userId_idx" ON "RecurringInvoice"("userId");
CREATE INDEX "RecurringInvoice_clientId_idx" ON "RecurringInvoice"("clientId");
