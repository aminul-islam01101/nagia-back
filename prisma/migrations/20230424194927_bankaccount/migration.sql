/*
  Warnings:

  - You are about to drop the column `amount` on the `SellProduct` table. All the data in the column will be lost.
  - Added the required column `bankAccount` to the `SellProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SellProduct" DROP COLUMN "amount",
ADD COLUMN     "bankAccount" TEXT NOT NULL;
