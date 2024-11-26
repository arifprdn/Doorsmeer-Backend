-- CreateTable
CREATE TABLE "DoorsmeerStatus" (
    "id" SERIAL NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoorsmeerStatus_pkey" PRIMARY KEY ("id")
);
