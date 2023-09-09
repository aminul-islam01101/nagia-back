-- AlterTable
ALTER TABLE "UserInvestment" ADD COLUMN     "sellRequestQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "soldQuantity" INTEGER NOT NULL DEFAULT 0;
