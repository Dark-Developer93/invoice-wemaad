/*
  Warnings:

  - You are about to drop the column `clientAddress` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `clientEmail` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `clientName` on the `Invoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "clientAddress",
DROP COLUMN "clientEmail",
DROP COLUMN "clientName";
