-- CreateEnum
CREATE TYPE "Status" AS ENUM ('SEDANG_MENGANTRI', 'SEDANG_DICUCI', 'SELESAI');

-- CreateTable
CREATE TABLE "Antrian" (
    "id" SERIAL NOT NULL,
    "status" "Status" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Antrian_pkey" PRIMARY KEY ("id")
);
