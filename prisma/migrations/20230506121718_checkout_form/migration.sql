-- CreateTable
CREATE TABLE "Checkout" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "acceptTerms" BOOLEAN NOT NULL,

    CONSTRAINT "Checkout_pkey" PRIMARY KEY ("id")
);
