/*
  Warnings:

  - A unique constraint covering the columns `[email,documento,ativo]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Usuario_email_documento_key";

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_documento_ativo_key" ON "Usuario"("email", "documento", "ativo");
