/*
  Warnings:

  - You are about to drop the column `transaksiId` on the `Jasa` table. All the data in the column will be lost.
  - Made the column `transaksiId` on table `Antrian` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Antrian" DROP CONSTRAINT "Antrian_transaksiId_fkey";

-- DropForeignKey
ALTER TABLE "Jasa" DROP CONSTRAINT "Jasa_transaksiId_fkey";

-- DropIndex
DROP INDEX "Jasa_transaksiId_key";

-- AlterTable
ALTER TABLE "Antrian" ALTER COLUMN "transaksiId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Jasa" DROP COLUMN "transaksiId";

-- AlterTable
ALTER TABLE "Transaksi" ADD COLUMN     "jasaId" INTEGER;

-- AddForeignKey
ALTER TABLE "Antrian" ADD CONSTRAINT "Antrian_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES "Transaksi"("payment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_jasaId_fkey" FOREIGN KEY ("jasaId") REFERENCES "Jasa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
