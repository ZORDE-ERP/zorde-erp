# Migrations

Este projeto usa Prisma com PostgreSQL. O schema principal fica em:

```text
apps/api/zorde-erp-empresas/prisma/schema.prisma
```

O `prisma.config.ts` do app define:

```text
schema: prisma/schema.prisma
migrations: prisma/migrations
datasource: DATABASE_URL
```

## Regras

1. Nunca use `prisma db push` para evolucao de schema em ambiente compartilhado.
2. Toda alteracao estrutural deve nascer de uma migration versionada.
3. Antes de rodar migration, valide o schema com `npm run prisma:validate`.
4. Gere migrations a partir da pasta `apps/api/zorde-erp-empresas`.
5. Revise o SQL gerado antes de aplicar em staging ou producao.
6. Se a migration renomear tabelas/colunas existentes, ajuste manualmente o SQL para evitar perda de dados.

## Comandos

Dentro de `apps/api/zorde-erp-empresas`:

```bash
npm run prisma:validate
npx prisma migrate dev --name nome_da_migration
npm run prisma:generate
```

Para aplicar migrations ja existentes:

```bash
npx prisma migrate deploy
```

Para inspecionar o status:

```bash
npx prisma migrate status
```

## Convencoes

- Models Prisma usam `PascalCase`.
- Tabelas no banco usam `snake_case` via `@@map`.
- Colunas no banco usam `snake_case` via `@map` quando o nome TypeScript for `camelCase`.
- Todos os models de negocio devem declarar `@@schema("comercial")`.
- Campos financeiros devem usar `Decimal` com `@db.Decimal(10, 2)`.
- Registros principais devem ter `createdAt`, `updatedAt` e, quando fizer sentido, `deletedAt`.

## Fluxo seguro

1. Alterar `schema.prisma`.
2. Rodar `npm run prisma:validate`.
3. Gerar migration com `npx prisma migrate dev --name ...`.
4. Revisar SQL em `prisma/migrations`.
5. Rodar `npm run prisma:generate`.
6. Ajustar codigo TypeScript afetado pelo Prisma Client.
