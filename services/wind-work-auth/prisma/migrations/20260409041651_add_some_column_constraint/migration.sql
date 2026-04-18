/*
  Warnings:

  - A unique constraint covering the columns `[user_id,method,identifier]` on the table `authentication_methods` will be added. If there are existing duplicate values, this will fail.
  - Made the column `user_id` on table `authentication_methods` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "authentication_methods" DROP CONSTRAINT "authentication_methods_user_id_fkey";

-- AlterTable
ALTER TABLE "authentication_methods" ALTER COLUMN "user_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "authentication_methods_user_id_method_identifier_key" ON "authentication_methods"("user_id", "method", "identifier");

-- AddForeignKey
ALTER TABLE "authentication_methods" ADD CONSTRAINT "authentication_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
