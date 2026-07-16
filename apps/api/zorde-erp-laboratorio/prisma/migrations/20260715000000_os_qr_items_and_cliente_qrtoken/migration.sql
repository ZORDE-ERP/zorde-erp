-- Ensure financeiro schema exists (declared in datasource, may be unused yet)
CREATE SCHEMA IF NOT EXISTS "financeiro";

-- Enums
CREATE TYPE "entidades"."StatusOrdemServico" AS ENUM ('LANCADA', 'FATURADA', 'CANCELADA');
CREATE TYPE "entidades"."OrigemOrdemServico" AS ENUM ('MANUAL', 'QR_SCAN');
CREATE TYPE "entidades"."OrigemValorItem" AS ENUM ('TABELA', 'MANUAL');

-- Cliente QR fields
ALTER TABLE "entidades"."Cliente"
ADD COLUMN "qrToken" VARCHAR(64),
ADD COLUMN "qrGeradoEm" TIMESTAMP(3);

CREATE UNIQUE INDEX "Cliente_qrToken_key" ON "entidades"."Cliente"("qrToken");

-- OrdemDeServico: add new columns while keeping legacy ones for backfill
ALTER TABLE "entidades"."OrdemDeServico"
ADD COLUMN "valorTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "status" "entidades"."StatusOrdemServico" NOT NULL DEFAULT 'LANCADA',
ADD COLUMN "origem" "entidades"."OrigemOrdemServico" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN "observacao" TEXT;

-- ItemOrdemDeServico table (FKs added after backfill)
CREATE TABLE "entidades"."ItemOrdemDeServico" (
    "id" SERIAL NOT NULL,
    "ordemDeServicoId" INTEGER NOT NULL,
    "tabelaMontagemId" INTEGER,
    "descricaoManual" TEXT,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "valorUnitario" DOUBLE PRECISION NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "origemValor" "entidades"."OrigemValorItem" NOT NULL DEFAULT 'TABELA',

    CONSTRAINT "ItemOrdemDeServico_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ItemOrdemDeServico_ordemDeServicoId_idx" ON "entidades"."ItemOrdemDeServico"("ordemDeServicoId");
CREATE INDEX "ItemOrdemDeServico_tabelaMontagemId_idx" ON "entidades"."ItemOrdemDeServico"("tabelaMontagemId");

-- Backfill valorTotal from legacy valor
UPDATE "entidades"."OrdemDeServico"
SET "valorTotal" = COALESCE("valor", 0);

-- One legacy item per existing OS (preserve data before dropping columns)
INSERT INTO "entidades"."ItemOrdemDeServico" (
    "ordemDeServicoId",
    "tabelaMontagemId",
    "descricaoManual",
    "quantidade",
    "valorUnitario",
    "valorTotal",
    "origemValor"
)
SELECT
    os."id",
    os."tabelaMontagemId",
    NULL,
    1,
    COALESCE(os."valor", tm."valor", 0),
    COALESCE(os."valor", tm."valor", 0),
    'TABELA'::"entidades"."OrigemValorItem"
FROM "entidades"."OrdemDeServico" os
LEFT JOIN "entidades"."TabelaMontagem" tm ON tm."id" = os."tabelaMontagemId";

-- Drop legacy OS columns and FK
ALTER TABLE "entidades"."OrdemDeServico"
DROP CONSTRAINT IF EXISTS "OrdemDeServico_tabelaMontagemId_fkey";

DROP INDEX IF EXISTS "entidades"."OrdemDeServico_tabelaMontagemId_idx";

ALTER TABLE "entidades"."OrdemDeServico"
DROP COLUMN "tabelaMontagemId",
DROP COLUMN "valor";

CREATE INDEX "OrdemDeServico_usuarioId_status_idx"
ON "entidades"."OrdemDeServico"("usuarioId", "status");

-- Wire FKs on items
ALTER TABLE "entidades"."ItemOrdemDeServico"
ADD CONSTRAINT "ItemOrdemDeServico_ordemDeServicoId_fkey"
FOREIGN KEY ("ordemDeServicoId") REFERENCES "entidades"."OrdemDeServico"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "entidades"."ItemOrdemDeServico"
ADD CONSTRAINT "ItemOrdemDeServico_tabelaMontagemId_fkey"
FOREIGN KEY ("tabelaMontagemId") REFERENCES "entidades"."TabelaMontagem"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
