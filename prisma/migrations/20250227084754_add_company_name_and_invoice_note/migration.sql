/*
  Warnings:

  - You are about to drop the column `note` on the `Invoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "note",
ADD COLUMN     "invoiceNote" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "companyName" TEXT;
