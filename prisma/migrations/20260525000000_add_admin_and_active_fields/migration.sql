-- AlterTable
ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Set admin for the designated admin email
UPDATE "User" SET "isAdmin" = true WHERE "email" = 'eng.abdullahhasan2016@gmail.com';
