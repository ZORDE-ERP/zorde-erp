/*
  Warnings:

  - You are about to drop the `autenticacao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `clientes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fornecedores` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ordens_de_servico` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `solicitacao_cadastro` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tabelas_montagem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "autenticacao" DROP CONSTRAINT "autenticacao_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "clientes" DROP CONSTRAINT "clientes_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "fornecedores" DROP CONSTRAINT "fornecedores_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "ordens_de_servico" DROP CONSTRAINT "ordens_de_servico_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "ordens_de_servico" DROP CONSTRAINT "ordens_de_servico_tabela_montagem_id_fkey";

-- DropForeignKey
ALTER TABLE "ordens_de_servico" DROP CONSTRAINT "ordens_de_servico_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "tabelas_montagem" DROP CONSTRAINT "tabelas_montagem_cliente_id_fkey";

-- DropTable
DROP TABLE "autenticacao";

-- DropTable
DROP TABLE "clientes";

-- DropTable
DROP TABLE "fornecedores";

-- DropTable
DROP TABLE "ordens_de_servico";

-- DropTable
DROP TABLE "solicitacao_cadastro";

-- DropTable
DROP TABLE "tabelas_montagem";

-- DropTable
DROP TABLE "usuarios";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "contato" TEXT NOT NULL,
    "ultimoAcesso" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Autenticacao" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "ip" TEXT,
    "dispositivo" TEXT,
    "navegador" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Autenticacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contato" TEXT,
    "tipoPessoa" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "cep" TEXT,
    "uf" TEXT,
    "cidade" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "observacao" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contato" TEXT,
    "tipoPessoa" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "cep" TEXT,
    "uf" TEXT,
    "cidade" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "observacao" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TabelaMontagem" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "servico" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TabelaMontagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdemDeServico" (
    "id" SERIAL NOT NULL,
    "codigoOS" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION,
    "tabelaMontagemId" INTEGER,
    "usuarioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OrdemDeServico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitacaoCadastro" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "codigo" VARCHAR(6) NOT NULL,
    "expiracao" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolicitacaoCadastro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_documento_key" ON "Usuario"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_documento_key" ON "Usuario"("email", "documento");

-- CreateIndex
CREATE UNIQUE INDEX "Autenticacao_refreshToken_key" ON "Autenticacao"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "SolicitacaoCadastro_email_key" ON "SolicitacaoCadastro"("email");

-- AddForeignKey
ALTER TABLE "Autenticacao" ADD CONSTRAINT "Autenticacao_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fornecedor" ADD CONSTRAINT "Fornecedor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TabelaMontagem" ADD CONSTRAINT "TabelaMontagem_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemDeServico" ADD CONSTRAINT "OrdemDeServico_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemDeServico" ADD CONSTRAINT "OrdemDeServico_tabelaMontagemId_fkey" FOREIGN KEY ("tabelaMontagemId") REFERENCES "TabelaMontagem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemDeServico" ADD CONSTRAINT "OrdemDeServico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
