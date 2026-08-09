-- CreateEnum
CREATE TYPE "SupportLevel" AS ENUM ('STANDARD', 'PRIORITY', 'DEDICATED');

-- AlterTable: add the new structured feature columns
ALTER TABLE "PlanConfig"
  ADD COLUMN "customIntegrations" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "supportLevel" "SupportLevel" NOT NULL DEFAULT 'STANDARD',
  ADD COLUMN "slaGuarantee" BOOLEAN NOT NULL DEFAULT false;

-- Backfill per plan (PlanConfig has exactly one row per PlanType). These
-- replace what used to be free-text lines in extraFeatures ("Priority
-- email support", "Priority support", "Custom integrations", "Dedicated
-- support", "SLA guarantee") with real, admin-toggleable fields.
UPDATE "PlanConfig" SET
  "supportLevel" = CASE "plan"
    WHEN 'FREE' THEN 'STANDARD'
    WHEN 'STARTER' THEN 'PRIORITY'
    WHEN 'PRO' THEN 'PRIORITY'
    WHEN 'BUSINESS' THEN 'DEDICATED'
  END::"SupportLevel",
  "customIntegrations" = ("plan" = 'BUSINESS'),
  "slaGuarantee" = ("plan" = 'BUSINESS');

-- AlterTable: drop the free-text feature list — every marketing bullet on
-- the pricing page is now derived from a real, gated field instead of
-- typed-in copy that could drift out of sync with what's actually toggled.
ALTER TABLE "PlanConfig" DROP COLUMN "extraFeatures";
