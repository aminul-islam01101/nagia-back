/*
  Warnings:

  - Added the required column `oldAmount` to the `InvestmentOpportunity` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `amount` on the `InvestmentOpportunity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "InvestmentOpportunity" ADD COLUMN     "oldAmount" INTEGER NOT NULL,
DROP COLUMN "amount",
ADD COLUMN     "amount" INTEGER NOT NULL;
