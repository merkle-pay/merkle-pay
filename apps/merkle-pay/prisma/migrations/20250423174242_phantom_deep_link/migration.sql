-- CreateTable
CREATE TABLE "PhantomDeepLink" (
    "id" SERIAL NOT NULL,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mpid" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentId" INTEGER NOT NULL,

    CONSTRAINT "PhantomDeepLink_pkey" PRIMARY KEY ("id")
);
