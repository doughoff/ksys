-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_entity_id_fkey";

-- AlterTable
ALTER TABLE "Sale" ALTER COLUMN "entity_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
