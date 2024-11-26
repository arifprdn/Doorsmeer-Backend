-- AlterTable
ALTER TABLE "Transaksi" ADD COLUMN     "payment_type" TEXT NOT NULL DEFAULT 'Tunai';

-- CreateTable
CREATE TABLE "Jasa" (
    "id" SERIAL NOT NULL,
    "namaJasa" TEXT NOT NULL,
    "harga" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transaksiId" INTEGER,

    CONSTRAINT "Jasa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Jasa_transaksiId_key" ON "Jasa"("transaksiId");

-- AddForeignKey
ALTER TABLE "Jasa" ADD CONSTRAINT "Jasa_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi"("payment_id") ON DELETE SET NULL ON UPDATE CASCADE;
