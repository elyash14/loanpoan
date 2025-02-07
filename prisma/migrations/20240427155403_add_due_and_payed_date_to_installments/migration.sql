-- AlterTable
ALTER TABLE "Account"
ADD COLUMN "openedAt" TIMESTAMP(3);
-- AlterTable
ALTER TABLE "Installment"
ADD COLUMN "dueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "payedAt" TIMESTAMP(3);
-- AlterTable
ALTER TABLE "User"
ALTER COLUMN "role"
SET DEFAULT 'USER';