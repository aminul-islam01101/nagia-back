-- DropForeignKey
ALTER TABLE "SellProduct" DROP CONSTRAINT "SellProduct_userInvestmentId_fkey";

-- AddForeignKey
ALTER TABLE "SellProduct" ADD CONSTRAINT "SellProduct_userInvestmentId_fkey" FOREIGN KEY ("userInvestmentId") REFERENCES "UserInvestment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
