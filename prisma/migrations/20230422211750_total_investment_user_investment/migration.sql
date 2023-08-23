/*
  Warnings:

  - Added the required column `totalInvestment` to the `UserInvestment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserInvestment" ADD COLUMN     "totalInvestment" INTEGER NOT NULL;
