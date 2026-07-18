-- Cliente QR image fields
ALTER TABLE "entidades"."Cliente"
ADD COLUMN "qrCodeUrl" TEXT,
ADD COLUMN "qrCodePublicId" TEXT;

-- Folha status enum
CREATE TYPE "entidades"."StatusFolhaOs" AS ENUM ('IMPRESSA', 'LANCADA', 'CANCELADA');

-- Lote de impressão
CREATE TABLE "entidades"."LoteImpressaoOs" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoteImpressaoOs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LoteImpressaoOs_clienteId_idx" ON "entidades"."LoteImpressaoOs"("clienteId");
CREATE INDEX "LoteImpressaoOs_usuarioId_idx" ON "entidades"."LoteImpressaoOs"("usuarioId");
CREATE INDEX "LoteImpressaoOs_usuarioId_clienteId_idx" ON "entidades"."LoteImpressaoOs"("usuarioId", "clienteId");

ALTER TABLE "entidades"."LoteImpressaoOs"
ADD CONSTRAINT "LoteImpressaoOs_clienteId_fkey"
FOREIGN KEY ("clienteId") REFERENCES "entidades"."Cliente"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "entidades"."LoteImpressaoOs"
ADD CONSTRAINT "LoteImpressaoOs_usuarioId_fkey"
FOREIGN KEY ("usuarioId") REFERENCES "entidades"."Usuario"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Folhas impressas
CREATE TABLE "entidades"."FolhaOsImpressa" (
    "id" SERIAL NOT NULL,
    "loteId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "codigoFolha" TEXT NOT NULL,
    "status" "entidades"."StatusFolhaOs" NOT NULL DEFAULT 'IMPRESSA',
    "ordemDeServicoId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FolhaOsImpressa_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FolhaOsImpressa_ordemDeServicoId_key" ON "entidades"."FolhaOsImpressa"("ordemDeServicoId");
CREATE UNIQUE INDEX "uni_folha_os_usuario_codigo" ON "entidades"."FolhaOsImpressa"("usuarioId", "codigoFolha");
CREATE INDEX "FolhaOsImpressa_loteId_idx" ON "entidades"."FolhaOsImpressa"("loteId");
CREATE INDEX "FolhaOsImpressa_clienteId_idx" ON "entidades"."FolhaOsImpressa"("clienteId");
CREATE INDEX "FolhaOsImpressa_usuarioId_idx" ON "entidades"."FolhaOsImpressa"("usuarioId");
CREATE INDEX "FolhaOsImpressa_usuarioId_clienteId_status_idx" ON "entidades"."FolhaOsImpressa"("usuarioId", "clienteId", "status");

ALTER TABLE "entidades"."FolhaOsImpressa"
ADD CONSTRAINT "FolhaOsImpressa_loteId_fkey"
FOREIGN KEY ("loteId") REFERENCES "entidades"."LoteImpressaoOs"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "entidades"."FolhaOsImpressa"
ADD CONSTRAINT "FolhaOsImpressa_clienteId_fkey"
FOREIGN KEY ("clienteId") REFERENCES "entidades"."Cliente"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "entidades"."FolhaOsImpressa"
ADD CONSTRAINT "FolhaOsImpressa_usuarioId_fkey"
FOREIGN KEY ("usuarioId") REFERENCES "entidades"."Usuario"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "entidades"."FolhaOsImpressa"
ADD CONSTRAINT "FolhaOsImpressa_ordemDeServicoId_fkey"
FOREIGN KEY ("ordemDeServicoId") REFERENCES "entidades"."OrdemDeServico"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
