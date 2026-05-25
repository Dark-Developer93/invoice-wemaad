-- Change numeric fields in Invoice from INTEGER to DOUBLE PRECISION
ALTER TABLE "Invoice"
  ALTER COLUMN "total" TYPE DOUBLE PRECISION,
  ALTER COLUMN "invoiceItemQuantity" TYPE DOUBLE PRECISION,
  ALTER COLUMN "invoiceItemRate" TYPE DOUBLE PRECISION;

-- Change numeric fields in RecurringInvoice from INTEGER to DOUBLE PRECISION
ALTER TABLE "RecurringInvoice"
  ALTER COLUMN "total" TYPE DOUBLE PRECISION,
  ALTER COLUMN "invoiceItemQuantity" TYPE DOUBLE PRECISION,
  ALTER COLUMN "invoiceItemRate" TYPE DOUBLE PRECISION;

-- CreateEnum
CREATE TYPE "UpgradeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "PlanUpgradeRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestedPlan" "PlanType" NOT NULL,
    "status" "UpgradeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanUpgradeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanUpgradeRequest_userId_status_idx" ON "PlanUpgradeRequest"("userId", "status");

-- AddForeignKey
ALTER TABLE "PlanUpgradeRequest" ADD CONSTRAINT "PlanUpgradeRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
