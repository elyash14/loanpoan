-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('IN_PROGRESS', 'FINISHED');

-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "status" "LoanStatus" NOT NULL DEFAULT 'IN_PROGRESS';
