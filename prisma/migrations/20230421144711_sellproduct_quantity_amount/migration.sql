/*
  Warnings:

  - Added the required column `amount` to the `SellProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `SellProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SellProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SellProduct" ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
