-- Store money as fixed-precision DECIMAL instead of floating-point DOUBLE PRECISION
-- to remove rounding-drift risk on invoice totals.
ALTER TABLE "Invoice"
  ALTER COLUMN "total" TYPE DECIMAL(12,2) USING ROUND("total"::numeric, 2);

ALTER TABLE "RecurringInvoice"
  ALTER COLUMN "total" TYPE DECIMAL(12,2) USING ROUND("total"::numeric, 2);

-- Deduplicate existing invoiceNumber collisions before enforcing uniqueness.
-- For each (userId, invoiceNumber) group, the oldest invoice keeps its number;
-- every later duplicate is renumbered to a fresh, non-colliding number above
-- that user's current max invoiceNumber.
WITH ranked AS (
  SELECT
    id,
    "userId",
    ROW_NUMBER() OVER (PARTITION BY "userId", "invoiceNumber" ORDER BY "createdAt") AS rn
  FROM "Invoice"
  WHERE "userId" IS NOT NULL
),
dupes AS (
  SELECT id, "userId" FROM ranked WHERE rn > 1
),
renumbered AS (
  SELECT
    d.id,
    (SELECT COALESCE(MAX("invoiceNumber"), 0) FROM "Invoice" WHERE "userId" = d."userId")
      + ROW_NUMBER() OVER (PARTITION BY d."userId" ORDER BY d.id) AS new_number
  FROM dupes d
)
UPDATE "Invoice" i
SET "invoiceNumber" = r.new_number
FROM renumbered r
WHERE i.id = r.id;

-- Prevent duplicate invoice numbers for the same user (previously unenforced,
-- relying only on application-level sequencing).
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_invoiceNumber_key" UNIQUE ("userId", "invoiceNumber");

-- Indexes on foreign keys / filter columns used by nearly every dashboard,
-- list, and report query.
CREATE INDEX "Invoice_userId_idx" ON "Invoice"("userId");
CREATE INDEX "Invoice_clientId_idx" ON "Invoice"("clientId");
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");
CREATE INDEX "RecurringInvoice_userId_idx" ON "RecurringInvoice"("userId");
CREATE INDEX "RecurringInvoice_clientId_idx" ON "RecurringInvoice"("clientId");
