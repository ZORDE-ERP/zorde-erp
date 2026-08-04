-- Logo image fields for Cliente and Fornecedor
ALTER TABLE "entidades"."Cliente"
ADD COLUMN "logoUrl" TEXT,
ADD COLUMN "logoPublicId" TEXT;

ALTER TABLE "entidades"."Fornecedor"
ADD COLUMN "logoUrl" TEXT,
ADD COLUMN "logoPublicId" TEXT;
