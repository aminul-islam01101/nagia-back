/*
  Warnings:

  - You are about to drop the column `quantity` on the `InvestmentOpportunity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InvestmentOpportunity" DROP COLUMN "quantity";

-- AlterTable
ALTER TABLE "UserInvestment" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
