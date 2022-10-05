/*
  Warnings:

  - The values [PENDING] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('ACTIVE', 'DELETED');
ALTER TABLE "Payment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "stock_entries" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Credit" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "sale_items" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Entity" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Interest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Sale" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "stock_entry_items" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Entity" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TABLE "Product" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TABLE "stock_entries" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TABLE "stock_entry_items" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TABLE "Sale" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TABLE "sale_items" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TABLE "Credit" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TABLE "Interest" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TABLE "Payment" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "Status_old";
ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
ALTER TABLE "stock_entries" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
ALTER TABLE "Credit" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
ALTER TABLE "sale_items" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
ALTER TABLE "Entity" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
ALTER TABLE "Interest" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
ALTER TABLE "Product" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
ALTER TABLE "Sale" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
ALTER TABLE "stock_entry_items" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;
