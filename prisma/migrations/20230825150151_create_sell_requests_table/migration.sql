-- CreateTable
CREATE TABLE "SellRequests" (
    "id" TEXT NOT NULL,
    "seller" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,
    "investmentOpportunityId" TEXT NOT NULL,
    "userInvestmentId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,

    CONSTRAINT "SellRequests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SellRequests" ADD CONSTRAINT "SellRequests_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequests" ADD CONSTRAINT "SellRequests_investmentOpportunityId_fkey" FOREIGN KEY ("investmentOpportunityId") REFERENCES "InvestmentOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequests" ADD CONSTRAINT "SellRequests_userInvestmentId_fkey" FOREIGN KEY ("userInvestmentId") REFERENCES "UserInvestment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequests" ADD CONSTRAINT "SellRequests_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
