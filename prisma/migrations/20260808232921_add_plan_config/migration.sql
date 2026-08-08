-- CreateTable
CREATE TABLE "PlanConfig" (
    "id" TEXT NOT NULL,
    "plan" "PlanType" NOT NULL,
    "price" INTEGER,
    "invoiceLimit" INTEGER,
    "emailLimit" INTEGER,
    "recurringInvoices" BOOLEAN NOT NULL DEFAULT false,
    "analytics" BOOLEAN NOT NULL DEFAULT false,
    "customBranding" BOOLEAN NOT NULL DEFAULT false,
    "teamCollaboration" BOOLEAN NOT NULL DEFAULT false,
    "apiAccess" BOOLEAN NOT NULL DEFAULT false,
    "multiUser" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanConfig_plan_key" ON "PlanConfig"("plan");

-- Seed with the values that were previously hardcoded in lib/plans.ts, so
-- behavior is unchanged until an admin edits them.
INSERT INTO "PlanConfig" ("id", "plan", "price", "invoiceLimit", "emailLimit", "recurringInvoices", "analytics", "customBranding", "teamCollaboration", "apiAccess", "multiUser", "updatedAt")
VALUES
    (gen_random_uuid()::text, 'FREE',     0,    5,    20,  false, false, false, false, false, false, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'STARTER',  9,    25,   50,  true,  true,  false, false, false, false, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'PRO',      29,   100,  500, true,  true,  true,  true,  true,  false, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'BUSINESS', NULL, NULL, NULL, true, true,  true,  true,  true,  true,  CURRENT_TIMESTAMP);
