/*
  Warnings:

  - Added the required column `status` to the `UserInvestment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionType` to the `UserInvestment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('completed', 'pending', 'failed');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Deposit', 'Cashout');

-- AlterTable
ALTER TABLE "UserInvestment" ADD COLUMN     "status" "Status" NOT NULL,
ADD COLUMN     "transactionType" "TransactionType" NOT NULL;
