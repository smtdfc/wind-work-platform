/*
  Warnings:

  - Added the required column `last_used_at` to the `authentication_methods` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "authentication_methods" ADD COLUMN     "identifier" TEXT,
ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_used_at" TIMESTAMP(3) NOT NULL;
