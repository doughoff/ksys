-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('CREATE', 'UPDATE');

-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "table" TEXT NOT NULL,
    "row_id" INTEGER NOT NULL,
    "type" "LogType" NOT NULL,
    "data" JSONB,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);
