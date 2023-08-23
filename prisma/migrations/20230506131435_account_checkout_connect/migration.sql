/*
  Warnings:

  - Added the required column `accountId` to the `Checkout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Checkout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Checkout" ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Checkout" ADD CONSTRAINT "Checkout_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
