/*
  Warnings:

  - Added the required column `payment_process_id` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "payment_process_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "PaymentProcess" (
    "id" SERIAL NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "PaymentProcess_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentProcess" ADD CONSTRAINT "PaymentProcess_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_payment_process_id_fkey" FOREIGN KEY ("payment_process_id") REFERENCES "PaymentProcess"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
