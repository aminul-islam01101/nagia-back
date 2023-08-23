/*
  Warnings:

  - Added the required column `growthRate` to the `InvestmentOpportunity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InvestmentOpportunity" ADD COLUMN     "feesAndExpenses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "growthRate" INTEGER NOT NULL;
