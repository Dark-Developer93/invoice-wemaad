-- Add nullable "items" JSONB column to Invoice and RecurringInvoice
ALTER TABLE "Invoice" ADD COLUMN "items" JSONB;
ALTER TABLE "RecurringInvoice" ADD COLUMN "items" JSONB;

-- Backfill existing single-item rows into a one-element items array
UPDATE "Invoice"
SET "items" = jsonb_build_array(
  jsonb_build_object(
    'description', "invoiceItemDescription",
    'quantity', "invoiceItemQuantity",
    'rate', "invoiceItemRate"
  )
);

UPDATE "RecurringInvoice"
SET "items" = jsonb_build_array(
  jsonb_build_object(
    'description', "invoiceItemDescription",
    'quantity', "invoiceItemQuantity",
    'rate', "invoiceItemRate"
  )
);

-- Make "items" required with a sensible default for future inserts
ALTER TABLE "Invoice" ALTER COLUMN "items" SET NOT NULL, ALTER COLUMN "items" SET DEFAULT '[]';
ALTER TABLE "RecurringInvoice" ALTER COLUMN "items" SET NOT NULL, ALTER COLUMN "items" SET DEFAULT '[]';

-- Drop the old single-item scalar columns
ALTER TABLE "Invoice"
  DROP COLUMN "invoiceItemDescription",
  DROP COLUMN "invoiceItemQuantity",
  DROP COLUMN "invoiceItemRate";

ALTER TABLE "RecurringInvoice"
  DROP COLUMN "invoiceItemDescription",
  DROP COLUMN "invoiceItemQuantity",
  DROP COLUMN "invoiceItemRate";
