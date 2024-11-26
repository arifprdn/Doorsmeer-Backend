/*
  Warnings:

  - Added the required column `namaKendaraan` to the `Antrian` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomorPolisi` to the `Antrian` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Antrian" ADD COLUMN     "namaKendaraan" TEXT NOT NULL,
ADD COLUMN     "nomorPolisi" TEXT NOT NULL;
