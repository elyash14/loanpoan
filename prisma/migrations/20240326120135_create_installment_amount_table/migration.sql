-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "deletedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "InstallmentAmount" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deprecatedAt" TIMESTAMP(3),

    CONSTRAINT "InstallmentAmount_pkey" PRIMARY KEY ("id")
);
