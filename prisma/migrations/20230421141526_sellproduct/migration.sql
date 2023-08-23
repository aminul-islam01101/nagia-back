-- CreateTable
CREATE TABLE "SellProduct" (
    "id" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "userInvestmentId" TEXT NOT NULL,

    CONSTRAINT "SellProduct_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SellProduct" ADD CONSTRAINT "SellProduct_userInvestmentId_fkey" FOREIGN KEY ("userInvestmentId") REFERENCES "UserInvestment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
