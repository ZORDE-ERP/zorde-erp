-- CreateTable
CREATE TABLE "entidades"."Servico" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Servico_pkey" PRIMARY KEY ("id")
);

-- Seed Servico from existing TabelaMontagem servico strings per usuario
INSERT INTO "entidades"."Servico" ("usuarioId", "nome", "createdAt")
SELECT DISTINCT c."usuarioId", tm."servico", CURRENT_TIMESTAMP
FROM "entidades"."TabelaMontagem" tm
JOIN "entidades"."Cliente" c ON c."id" = tm."clienteId";

-- Add servicoId column to TabelaMontagem
ALTER TABLE "entidades"."TabelaMontagem" ADD COLUMN "servicoId" INTEGER;

-- Populate servicoId from seeded Servico records
UPDATE "entidades"."TabelaMontagem" tm
SET "servicoId" = s."id"
FROM "entidades"."Cliente" c, "entidades"."Servico" s
WHERE tm."clienteId" = c."id"
  AND s."usuarioId" = c."usuarioId"
  AND s."nome" = tm."servico";

-- Drop old unique constraint and servico column
DROP INDEX IF EXISTS "entidades"."TabelaMontagem_clienteId_servico_key";
ALTER TABLE "entidades"."TabelaMontagem" DROP COLUMN "servico";

-- Make servicoId required
ALTER TABLE "entidades"."TabelaMontagem" ALTER COLUMN "servicoId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Servico_usuarioId_nome_key" ON "entidades"."Servico"("usuarioId", "nome");

-- CreateIndex
CREATE INDEX "Servico_usuarioId_idx" ON "entidades"."Servico"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "TabelaMontagem_clienteId_servicoId_key" ON "entidades"."TabelaMontagem"("clienteId", "servicoId");

-- AddForeignKey
ALTER TABLE "entidades"."Servico" ADD CONSTRAINT "Servico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "entidades"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entidades"."TabelaMontagem" ADD CONSTRAINT "TabelaMontagem_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "entidades"."Servico"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
