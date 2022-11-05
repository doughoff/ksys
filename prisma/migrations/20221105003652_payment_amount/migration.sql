/*
  Warnings:

  - Added the required column `amount` to the `PaymentProcess` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentProcess" ADD COLUMN     "amount" INTEGER NOT NULL;
