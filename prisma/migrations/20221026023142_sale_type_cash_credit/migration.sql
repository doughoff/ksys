-- CreateEnum
CREATE TYPE "SaleType" AS ENUM ('CREDIT', 'CASH');

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "type" "SaleType" NOT NULL DEFAULT 'CASH';
