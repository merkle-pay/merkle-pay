-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSED', 'CONFIRMED', 'FINALIZED', 'EXPIRED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "token" TEXT NOT NULL,
    "blockchain" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "recipient_address" TEXT,
    "payer_address" TEXT,
    "referencePublicKey" TEXT NOT NULL,
    "mpid" TEXT NOT NULL,
    "raw" JSONB NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_referencePublicKey_key" ON "Payment"("referencePublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_mpid_key" ON "Payment"("mpid");
