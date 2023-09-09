/*
  Warnings:

  - Added the required column `amount` to the `SellRequests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SellRequests" ADD COLUMN     "amount" INTEGER NOT NULL;
