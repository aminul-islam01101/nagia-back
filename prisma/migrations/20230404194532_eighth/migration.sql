/*
  Warnings:

  - You are about to drop the `InvestmentOpportunities` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "InvestmentOpportunities";

-- CreateTable
CREATE TABLE "InvestmentOpportunity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInvestment" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "investmentOpportunityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInvestment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserInvestment" ADD CONSTRAINT "UserInvestment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInvestment" ADD CONSTRAINT "UserInvestment_investmentOpportunityId_fkey" FOREIGN KEY ("investmentOpportunityId") REFERENCES "InvestmentOpportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
