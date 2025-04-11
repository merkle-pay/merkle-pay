-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "token" TEXT NOT NULL,
    "blockchain" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "referencePublicKey" TEXT NOT NULL,
    "mpid" TEXT NOT NULL,
    "raw" JSONB NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_referencePublicKey_key" ON "Payment"("referencePublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_mpid_key" ON "Payment"("mpid");
