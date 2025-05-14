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
    "business_name" TEXT NOT NULL DEFAULT '',
    "recipient_address" TEXT NOT NULL,
    "payer_address" TEXT,
    "referencePublicKey" TEXT NOT NULL,
    "mpid" TEXT NOT NULL,
    "raw" JSONB NOT NULL,
    "txId" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhantomDeepLink" (
    "id" SERIAL NOT NULL,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mpid" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "requestId" TEXT,
    "paymentId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "txId" TEXT,
    "phantom_encryption_public_key" TEXT,

    CONSTRAINT "PhantomDeepLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Boss" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "avatar_image_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'boss',
    "backup_email" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,

    CONSTRAINT "Boss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" SERIAL NOT NULL,
    "business_name" TEXT NOT NULL,
    "blockchains" TEXT[] DEFAULT ARRAY['solana']::TEXT[],
    "wallets" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "boss_id" INTEGER NOT NULL,
    "boss_email" TEXT NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "boss_id" INTEGER NOT NULL,
    "boss_email" TEXT NOT NULL,
    "is_access_token" BOOLEAN NOT NULL,
    "is_refresh_token" BOOLEAN NOT NULL,
    "scope" TEXT,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_referencePublicKey_key" ON "Payment"("referencePublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_mpid_key" ON "Payment"("mpid");

-- CreateIndex
CREATE UNIQUE INDEX "Boss_username_key" ON "Boss"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Boss_email_key" ON "Boss"("email");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_boss_id_fkey" FOREIGN KEY ("boss_id") REFERENCES "Boss"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_boss_id_fkey" FOREIGN KEY ("boss_id") REFERENCES "Boss"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
