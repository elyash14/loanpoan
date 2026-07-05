-- Rename misspelled columns
ALTER TABLE "User" RENAME COLUMN "cartNumber" TO "cardNumber";
ALTER TABLE "Config" RENAME COLUMN "descriptiion" TO "description";
ALTER TABLE "Payment" RENAME COLUMN "payedAt" TO "paidAt";
ALTER TABLE "Installment" RENAME COLUMN "payedAt" TO "paidAt";
