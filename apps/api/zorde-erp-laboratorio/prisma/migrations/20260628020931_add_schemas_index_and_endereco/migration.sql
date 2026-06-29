-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "autenticacao";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "enderecos";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "entidades";

-- CreateEnum
CREATE TYPE "entidades"."TipoUsuario" AS ENUM ('ADMIN', 'USUARIO');

-- CreateTable
CREATE TABLE "entidades"."Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "contato" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcesso" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "tipoUsuario" "entidades"."TipoUsuario" NOT NULL DEFAULT 'ADMIN',

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autenticacao"."Autenticacao" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "refreshToken" TEXT,
    "jti" TEXT,
    "ip" TEXT,
    "dispositivo" TEXT,
    "navegador" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Autenticacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entidades"."Cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contato" TEXT,
    "tipoPessoa" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "cep" TEXT,
    "razaoSocial" TEXT,
    "nomeFantasia" TEXT,
    "observacao" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entidades"."Fornecedor" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contato" TEXT,
    "tipoPessoa" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "cep" TEXT,
    "observacao" TEXT,
    "razaoSocial" TEXT,
    "nomeFantasia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entidades"."TabelaMontagem" (
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
CREATE TABLE "entidades"."OrdemDeServico" (
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
CREATE TABLE "autenticacao"."SolicitacaoCadastro" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "codigo" VARCHAR(6) NOT NULL,
    "expiracao" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolicitacaoCadastro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enderecos"."Endereco" (
    "id" SERIAL NOT NULL,
    "cep" TEXT,
    "uf" TEXT,
    "cidade" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "ibge" TEXT,
    "complemento" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Endereco_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "entidades"."Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_documento_key" ON "entidades"."Usuario"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_documento_ativo_key" ON "entidades"."Usuario"("email", "documento", "ativo");

-- CreateIndex
CREATE UNIQUE INDEX "Autenticacao_refreshToken_key" ON "autenticacao"."Autenticacao"("refreshToken");

-- CreateIndex
CREATE INDEX "Autenticacao_idUsuario_idx" ON "autenticacao"."Autenticacao"("idUsuario");

-- CreateIndex
CREATE INDEX "Autenticacao_jti_idx" ON "autenticacao"."Autenticacao"("jti");

-- CreateIndex
CREATE INDEX "Autenticacao_idUsuario_createdAt_idx" ON "autenticacao"."Autenticacao"("idUsuario", "createdAt");

-- CreateIndex
CREATE INDEX "Cliente_usuarioId_idx" ON "entidades"."Cliente"("usuarioId");

-- CreateIndex
CREATE INDEX "Cliente_documento_idx" ON "entidades"."Cliente"("documento");

-- CreateIndex
CREATE INDEX "Cliente_email_idx" ON "entidades"."Cliente"("email");

-- CreateIndex
CREATE INDEX "Cliente_usuarioId_status_idx" ON "entidades"."Cliente"("usuarioId", "status");

-- CreateIndex
CREATE INDEX "Cliente_usuarioId_deletedAt_idx" ON "entidades"."Cliente"("usuarioId", "deletedAt");

-- CreateIndex
CREATE INDEX "Fornecedor_usuarioId_idx" ON "entidades"."Fornecedor"("usuarioId");

-- CreateIndex
CREATE INDEX "Fornecedor_documento_idx" ON "entidades"."Fornecedor"("documento");

-- CreateIndex
CREATE INDEX "Fornecedor_email_idx" ON "entidades"."Fornecedor"("email");

-- CreateIndex
CREATE INDEX "Fornecedor_usuarioId_status_idx" ON "entidades"."Fornecedor"("usuarioId", "status");

-- CreateIndex
CREATE INDEX "Fornecedor_usuarioId_deletedAt_idx" ON "entidades"."Fornecedor"("usuarioId", "deletedAt");

-- CreateIndex
CREATE INDEX "TabelaMontagem_clienteId_idx" ON "entidades"."TabelaMontagem"("clienteId");

-- CreateIndex
CREATE INDEX "TabelaMontagem_clienteId_deletedAt_idx" ON "entidades"."TabelaMontagem"("clienteId", "deletedAt");

-- CreateIndex
CREATE INDEX "OrdemDeServico_usuarioId_clienteId_idx" ON "entidades"."OrdemDeServico"("usuarioId", "clienteId");

-- CreateIndex
CREATE INDEX "OrdemDeServico_usuarioId_idx" ON "entidades"."OrdemDeServico"("usuarioId");

-- CreateIndex
CREATE INDEX "OrdemDeServico_tabelaMontagemId_idx" ON "entidades"."OrdemDeServico"("tabelaMontagemId");

-- CreateIndex
CREATE INDEX "OrdemDeServico_codigoOS_idx" ON "entidades"."OrdemDeServico"("codigoOS");

-- CreateIndex
CREATE INDEX "OrdemDeServico_clienteId_deletedAt_idx" ON "entidades"."OrdemDeServico"("clienteId", "deletedAt");

-- CreateIndex
CREATE INDEX "OrdemDeServico_usuarioId_createdAt_idx" ON "entidades"."OrdemDeServico"("usuarioId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SolicitacaoCadastro_email_key" ON "autenticacao"."SolicitacaoCadastro"("email");

-- CreateIndex
CREATE INDEX "SolicitacaoCadastro_email_idx" ON "autenticacao"."SolicitacaoCadastro"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Endereco_cep_key" ON "enderecos"."Endereco"("cep");

-- CreateIndex
CREATE INDEX "Endereco_uf_cidade_idx" ON "enderecos"."Endereco"("uf", "cidade");

-- CreateIndex
CREATE INDEX "Endereco_ibge_idx" ON "enderecos"."Endereco"("ibge");

-- AddForeignKey
ALTER TABLE "autenticacao"."Autenticacao" ADD CONSTRAINT "Autenticacao_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "entidades"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entidades"."Cliente" ADD CONSTRAINT "Cliente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "entidades"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entidades"."Cliente" ADD CONSTRAINT "Cliente_cep_fkey" FOREIGN KEY ("cep") REFERENCES "enderecos"."Endereco"("cep") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entidades"."Fornecedor" ADD CONSTRAINT "Fornecedor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "entidades"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entidades"."Fornecedor" ADD CONSTRAINT "Fornecedor_cep_fkey" FOREIGN KEY ("cep") REFERENCES "enderecos"."Endereco"("cep") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entidades"."TabelaMontagem" ADD CONSTRAINT "TabelaMontagem_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "entidades"."Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entidades"."OrdemDeServico" ADD CONSTRAINT "OrdemDeServico_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "entidades"."Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entidades"."OrdemDeServico" ADD CONSTRAINT "OrdemDeServico_tabelaMontagemId_fkey" FOREIGN KEY ("tabelaMontagemId") REFERENCES "entidades"."TabelaMontagem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entidades"."OrdemDeServico" ADD CONSTRAINT "OrdemDeServico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "entidades"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
