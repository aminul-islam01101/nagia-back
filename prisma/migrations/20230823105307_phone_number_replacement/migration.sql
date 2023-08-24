/*
  Warnings:

  - You are about to drop the column `bankAccount` on the `SellProduct` table. All the data in the column will be lost.
  - Added the required column `phoneNumber` to the `SellProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SellProduct" DROP COLUMN "bankAccount",
ADD COLUMN     "phoneNumber" TEXT NOT NULL;
