-- Sequência compartilhada de códigos OS por tenant/cliente
CREATE TABLE "entidades"."SequenciaCodigoOs" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "proximoNumero" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SequenciaCodigoOs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "uni_sequencia_codigo_os_usuario_cliente"
    ON "entidades"."SequenciaCodigoOs"("usuarioId", "clienteId");

CREATE INDEX "SequenciaCodigoOs_clienteId_idx"
    ON "entidades"."SequenciaCodigoOs"("clienteId");

ALTER TABLE "entidades"."SequenciaCodigoOs"
    ADD CONSTRAINT "SequenciaCodigoOs_usuarioId_fkey"
    FOREIGN KEY ("usuarioId") REFERENCES "entidades"."Usuario"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "entidades"."SequenciaCodigoOs"
    ADD CONSTRAINT "SequenciaCodigoOs_clienteId_fkey"
    FOREIGN KEY ("clienteId") REFERENCES "entidades"."Cliente"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed: maior sufixo numérico já usado em folhas impressas ou OS por tenant/cliente
INSERT INTO "entidades"."SequenciaCodigoOs" ("usuarioId", "clienteId", "proximoNumero", "updatedAt")
SELECT
    combined."usuarioId",
    combined."clienteId",
    MAX(combined.num) + 1,
    NOW()
FROM (
    SELECT
        f."usuarioId",
        f."clienteId",
        CAST(SUBSTRING(f."codigoFolha" FROM 'OS-[0-9]+-([0-9]+)$') AS INTEGER) AS num
    FROM "entidades"."FolhaOsImpressa" f
    WHERE f."codigoFolha" ~ '^OS-[0-9]+-[0-9]+$'

    UNION ALL

    SELECT
        o."usuarioId",
        o."clienteId",
        CAST(SUBSTRING(o."codigoOS" FROM 'OS-[0-9]+-([0-9]+)$') AS INTEGER) AS num
    FROM "entidades"."OrdemDeServico" o
    WHERE o."codigoOS" ~ '^OS-[0-9]+-[0-9]+$'
      AND o."deletedAt" IS NULL
) combined
GROUP BY combined."usuarioId", combined."clienteId"
ON CONFLICT ("usuarioId", "clienteId")
DO UPDATE SET
    "proximoNumero" = GREATEST("entidades"."SequenciaCodigoOs"."proximoNumero", EXCLUDED."proximoNumero"),
    "updatedAt" = NOW();
