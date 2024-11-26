/*
  Warnings:

  - A unique constraint covering the columns `[transaksiId]` on the table `Antrian` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Antrian" ADD COLUMN     "EditedBy" TEXT NOT NULL DEFAULT 'User',
ADD COLUMN     "transaksiId" INTEGER;

-- CreateTable
CREATE TABLE "Admin" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "payment_id" SERIAL NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("payment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Antrian_transaksiId_key" ON "Antrian"("transaksiId");

-- AddForeignKey
ALTER TABLE "Antrian" ADD CONSTRAINT "Antrian_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi"("payment_id") ON DELETE SET NULL ON UPDATE CASCADE;
