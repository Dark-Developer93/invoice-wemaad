-- AlterTable
ALTER TABLE "PlanConfig" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "extraFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "popular" BOOLEAN NOT NULL DEFAULT false;

-- Backfill with the exact copy that used to be hardcoded in
-- components/pricing/PricingSection.tsx, so the public pricing page's
-- displayed content doesn't change until an admin edits it. The "N
-- invoices/emails per month" bullets aren't repeated here — the page now
-- derives those from invoiceLimit/emailLimit directly.
UPDATE "PlanConfig" SET
  "description" = 'Perfect for freelancers just starting out',
  "extraFeatures" = ARRAY['Client management', 'PDF generation & secure sharing', 'Automated invoice emails', 'Basic invoice templates']::TEXT[],
  "popular" = false
WHERE "plan" = 'FREE';

UPDATE "PlanConfig" SET
  "description" = 'Great for growing businesses',
  "extraFeatures" = ARRAY['Everything in Free', 'Recurring invoices automation', 'Financial reports & analytics', 'Priority email support']::TEXT[],
  "popular" = false
WHERE "plan" = 'STARTER';

UPDATE "PlanConfig" SET
  "description" = 'For established businesses',
  "extraFeatures" = ARRAY['Everything in Starter', 'Advanced analytics', 'Custom branding', 'Team collaboration', 'Basic API access', 'Priority support']::TEXT[],
  "popular" = true
WHERE "plan" = 'PRO';

UPDATE "PlanConfig" SET
  "description" = 'For large organizations',
  "extraFeatures" = ARRAY['Everything in Pro', 'Multi-user access', 'Advanced API access', 'Full custom branding', 'Custom integrations', 'Dedicated support', 'SLA guarantee']::TEXT[],
  "popular" = false
WHERE "plan" = 'BUSINESS';
