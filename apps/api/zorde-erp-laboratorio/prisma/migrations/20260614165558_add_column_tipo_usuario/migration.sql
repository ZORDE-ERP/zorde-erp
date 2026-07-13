-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('ADMIN', 'USUARIO');

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "tipoUsuario" "TipoUsuario" NOT NULL DEFAULT 'ADMIN';
