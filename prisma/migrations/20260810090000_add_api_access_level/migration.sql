-- CreateEnum
CREATE TYPE "ApiAccessLevel" AS ENUM ('NONE', 'BASIC', 'ADVANCED');

-- AlterTable: add the new column with a safe default first
ALTER TABLE "PlanConfig" ADD COLUMN "apiAccessLevel" "ApiAccessLevel" NOT NULL DEFAULT 'NONE';

-- Backfill per plan (PlanConfig has exactly one row per PlanType), same
-- approach as the analyticsLevel/brandingLevel migration — Pro and
-- Business both had apiAccess=true with no distinction between them, so
-- there's no boolean value to faithfully derive BASIC vs ADVANCED from.
UPDATE "PlanConfig" SET
  "apiAccessLevel" = CASE "plan"
    WHEN 'FREE' THEN 'NONE'
    WHEN 'STARTER' THEN 'NONE'
    WHEN 'PRO' THEN 'BASIC'
    WHEN 'BUSINESS' THEN 'ADVANCED'
  END::"ApiAccessLevel";

-- AlterTable: drop the boolean column now superseded by the enum above
ALTER TABLE "PlanConfig" DROP COLUMN "apiAccess";
