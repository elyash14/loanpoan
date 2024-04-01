/*
  Warnings:

  - You are about to drop the column `loanId` on the `Installment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Installment" DROP CONSTRAINT "Installment_loanId_fkey";

-- AlterTable
ALTER TABLE "Installment" DROP COLUMN "loanId",
ADD COLUMN     "accountId" INTEGER;

-- AddForeignKey
ALTER TABLE "Installment" ADD CONSTRAINT "Installment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
