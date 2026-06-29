/*
  Warnings:

  - A unique constraint covering the columns `[usuarioId,documento]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usuarioId,email]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usuarioId,documento]` on the table `Fornecedor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usuarioId,email]` on the table `Fornecedor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usuarioId,codigoOS,clienteId]` on the table `OrdemDeServico` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clienteId,servico]` on the table `TabelaMontagem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "SolicitacaoCadastro_expiracao_idx" ON "autenticacao"."SolicitacaoCadastro"("expiracao");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_usuarioId_documento_key" ON "entidades"."Cliente"("usuarioId", "documento");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_usuarioId_email_key" ON "entidades"."Cliente"("usuarioId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_usuarioId_documento_key" ON "entidades"."Fornecedor"("usuarioId", "documento");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_usuarioId_email_key" ON "entidades"."Fornecedor"("usuarioId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "OrdemDeServico_usuarioId_codigoOS_clienteId_key" ON "entidades"."OrdemDeServico"("usuarioId", "codigoOS", "clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "TabelaMontagem_clienteId_servico_key" ON "entidades"."TabelaMontagem"("clienteId", "servico");
