/*
  Warnings:

  - You are about to drop the column `boss_email` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `boss_id` on the `Business` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Business" DROP CONSTRAINT "Business_boss_id_fkey";

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "boss_email",
DROP COLUMN "boss_id";
