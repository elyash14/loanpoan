-- AlterTable
ALTER TABLE "User" ALTER COLUMN "profileColor" SET DEFAULT '#3B82F6';

UPDATE "User" SET "profileColor" = '#3B82F6' WHERE "profileColor" = 'ocean';
UPDATE "User" SET "profileColor" = '#8B5CF6' WHERE "profileColor" = 'violet';
UPDATE "User" SET "profileColor" = '#F97316' WHERE "profileColor" = 'sunset';
UPDATE "User" SET "profileColor" = '#10B981' WHERE "profileColor" = 'emerald';
UPDATE "User" SET "profileColor" = '#F43F5E' WHERE "profileColor" = 'rose';
