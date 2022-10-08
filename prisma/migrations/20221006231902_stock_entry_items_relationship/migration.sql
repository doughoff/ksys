/*
  Warnings:

  - Added the required column `stockEntryId` to the `stock_entry_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stock_entry_items" ADD COLUMN     "stockEntryId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "stock_entry_items" ADD CONSTRAINT "stock_entry_items_stockEntryId_fkey" FOREIGN KEY ("stockEntryId") REFERENCES "stock_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
