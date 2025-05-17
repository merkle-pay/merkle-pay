/*
  Warnings:

  - You are about to drop the column `blockchains` on the `Business` table. All the data in the column will be lost.
  - Added the required column `blockchain` to the `Business` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Business" DROP COLUMN "blockchains",
ADD COLUMN     "blockchain" TEXT NOT NULL,
ADD COLUMN     "tokens" TEXT[] DEFAULT ARRAY[]::TEXT[];
