/*
  Warnings:

  - Added the required column `quantity` to the `InvestmentOpportunity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InvestmentOpportunity" ADD COLUMN     "quantity" INTEGER NOT NULL;
