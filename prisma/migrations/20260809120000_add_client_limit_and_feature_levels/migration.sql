-- CreateEnum
CREATE TYPE "AnalyticsLevel" AS ENUM ('NONE', 'BASIC', 'ADVANCED');

-- CreateEnum
CREATE TYPE "BrandingLevel" AS ENUM ('SHOWN', 'MINIMAL', 'HIDDEN');

-- AlterTable: add new columns with safe defaults first
ALTER TABLE "PlanConfig"
  ADD COLUMN "clientLimit" INTEGER,
  ADD COLUMN "analyticsLevel" "AnalyticsLevel" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "brandingLevel" "BrandingLevel" NOT NULL DEFAULT 'SHOWN';

-- Backfill: PlanConfig has exactly one row per PlanType, so the new
-- three-tier fields (which the old booleans can't express — e.g. Pro's
-- new "minimal branding" tier didn't exist before) are seeded per plan
-- rather than derived from the boolean columns being dropped below.
UPDATE "PlanConfig" SET
  "clientLimit" = CASE "plan"
    WHEN 'FREE' THEN 3
    WHEN 'STARTER' THEN 15
    WHEN 'PRO' THEN 50
    WHEN 'BUSINESS' THEN NULL
  END,
  "analyticsLevel" = CASE "plan"
    WHEN 'FREE' THEN 'NONE'
    WHEN 'STARTER' THEN 'BASIC'
    WHEN 'PRO' THEN 'ADVANCED'
    WHEN 'BUSINESS' THEN 'ADVANCED'
  END::"AnalyticsLevel",
  "brandingLevel" = CASE "plan"
    WHEN 'FREE' THEN 'SHOWN'
    WHEN 'STARTER' THEN 'SHOWN'
    WHEN 'PRO' THEN 'MINIMAL'
    WHEN 'BUSINESS' THEN 'HIDDEN'
  END::"BrandingLevel";

-- AlterTable: drop the boolean columns now superseded by the enums above
ALTER TABLE "PlanConfig"
  DROP COLUMN "analytics",
  DROP COLUMN "customBranding";
