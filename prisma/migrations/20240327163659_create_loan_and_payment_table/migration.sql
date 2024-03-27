-- CreateTable
CREATE TABLE "Loan" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "accountId" INTEGER,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "payedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
