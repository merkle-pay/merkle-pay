/*
  Warnings:

  - Made the column `recipient_address` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "recipient_address" SET NOT NULL;
