-- AlterTable
ALTER TABLE "InvestmentNews" ALTER COLUMN "link" DROP NOT NULL,
ALTER COLUMN "source" DROP NOT NULL;

-- AlterTable
ALTER TABLE "InvestmentOpportunity" ALTER COLUMN "growthRate" DROP NOT NULL;
