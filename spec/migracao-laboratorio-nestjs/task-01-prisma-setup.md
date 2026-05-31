# Task 01: Modelagem e Infraestrutura do Banco (Prisma)

## 📌 Objetivo
Esta tarefa consiste em configurar a camada de banco de dados do microsserviço `apps/api/zorde-erp-laboratorio` utilizando **Prisma** e **PostgreSQL**. O subagent deve mapear exatamente os 7 modelos fornecidos na especificação técnica, respeitando chaves primárias, relações, chaves estrangeiras com comportamentos corretos (CASCADE, RESTRICT, SET NULL) e índices, além de configurar o serviço NestJS de conexão e o módulo correspondente.

---

## 🛠️ MCP (`context7`) — Como Obter Ajuda de Documentação
Se precisar de detalhes específicos sobre sintaxe do Prisma, tipos suportados ou transações/relacionamentos:
- Utilize a ferramenta de busca/MCP do `context7` para obter a documentação atual do **Prisma** (sintaxe de schemas Prisma).

---

## 📂 Diretórios & Arquivos Alvo
- Criar/Atualizar `apps/api/zorde-erp-laboratorio/prisma/schema.prisma`
- Criar/Atualizar `apps/api/zorde-erp-laboratorio/src/infra/database/prisma/prisma.service.ts`
- Criar/Atualizar `apps/api/zorde-erp-laboratorio/src/infra/database/database.module.ts`

---

## 📋 Checklist de Execução

### 1. Configuração do `schema.prisma`
Crie ou atualize o arquivo `schema.prisma` com o datasource PostgreSQL e o generator prisma-client-js, e declare as tabelas exatamente como abaixo:
- [ ] **Modelo `Usuario`** (Tabela `usuarios`):
  - `id`: `Int @id @default(autoincrement())`
  - `email`: `String @unique`
  - `senha`: `String`
  - `nome`: `String`
  - `documento`: `String @unique`
  - `contato`: `String`
  - `ultimo_acesso`: `DateTime?`
  - `created_at`: `DateTime @default(now())`
  - `updated_at`: `DateTime? @updatedAt`
  - Índice composto: `@@unique([email, documento], name: "uni_usuario_email_documento")`
  - Mapear para `@@map("usuarios")`
- [ ] **Modelo `Autenticacao`** (Tabela `autenticacao`):
  - `id`: `Int @id @default(autoincrement())`
  - `id_usuario`: `Int`
  - `refresh_token`: `String @unique`
  - `status`: `String @default("logado")`
  - `ip`: `String`
  - `dispositivo`: `String`
  - `navegador`: `String`
  - `created_at`: `DateTime @default(now())`
  - `updated_at`: `DateTime? @updatedAt`
  - Relação: `usuario Usuario @relation(fields: [id_usuario], references: [id], onDelete: Cascade)` (CASCADE update)
  - Mapear para `@@map("autenticacao")`
- [ ] **Modelo `Cliente`** (Tabela `clientes`):
  - `id`: `Int @id @default(autoincrement())`
  - `nome`: `String`
  - `email`: `String`
  - `contato`: `String?`
  - `tipo_pessoa`: `String`
  - `documento`: `String`
  - `status`: `String @default("ATIVO")`
  - `cep`: `String?`
  - `uf`: `String?`
  - `cidade`: `String?`
  - `logradouro`: `String?`
  - `numero`: `String?`
  - `bairro`: `String?`
  - `observacao`: `String?`
  - `usuario_id`: `Int`
  - `created_at`: `DateTime @default(now())`
  - `updated_at`: `DateTime? @updatedAt`
  - `deleted_at`: `DateTime?` (Índice opcional para Soft Delete)
  - Relação: `usuario Usuario @relation(fields: [usuario_id], references: [id], onDelete: Restrict)` (CASCADE update, RESTRICT delete)
  - Mapear para `@@map("clientes")`
- [ ] **Modelo `Fornecedor`** (Tabela `fornecedores`):
  - Mesmos campos de `Cliente` (incluindo `deleted_at` para soft delete).
  - Relação: `usuario Usuario @relation(fields: [usuario_id], references: [id], onDelete: Restrict)` (CASCADE update, RESTRICT delete)
  - Mapear para `@@map("fornecedores")`
- [ ] **Modelo `TabelaMontagem`** (Tabela `tabelas_montagem`):
  - `id`: `Int @id @default(autoincrement())`
  - `cliente_id`: `Int`
  - `servico`: `String` (Valores aceitos logicamente no domínio: `MONTAGEM SIMPLES`, `PARAFUSO`, `TRANSPOSICAO`, `COLORACAO`, `SOMENTE ENCAIXAR`)
  - `valor`: `Float`
  - `created_at`: `DateTime @default(now())`
  - `updated_at`: `DateTime? @updatedAt`
  - `deleted_at`: `DateTime?`
  - Relação: `cliente Cliente @relation(fields: [cliente_id], references: [id], onDelete: Restrict)`
  - Mapear para `@@map("tabelas_montagem")`
- [ ] **Modelo `OrdemDeServico`** (Tabela `ordens_de_servico`):
  - `id`: `Int @id @default(autoincrement())`
  - `codigo_os`: `String`
  - `cliente_id`: `Int`
  - `valor`: `Float?`
  - `tabela_montagem_id`: `Int?`
  - `usuario_id`: `Int`
  - `created_at`: `DateTime @default(now())`
  - `updated_at`: `DateTime? @updatedAt`
  - `deleted_at`: `DateTime?`
  - Relação `cliente`: `Cliente @relation(fields: [cliente_id], references: [id], onDelete: Restrict)`
  - Relação `tabelaMontagem`: `TabelaMontagem? @relation(fields: [tabela_montagem_id], references: [id], onDelete: SetNull)`
  - Relação `usuario`: `Usuario @relation(fields: [usuario_id], references: [id], onDelete: Restrict)`
  - Mapear para `@@map("ordens_de_servico")`
- [ ] **Modelo `SolicitacaoCadastro`** (Tabela `solicitacao_cadastro`):
  - `id`: `Int @id @default(autoincrement())`
  - `email`: `String @unique`
  - `codigo`: `String @db.VarChar(6)`
  - `expiracao`: `DateTime`
  - `criado_em`: `DateTime @default(now())`
  - Mapear para `@@map("solicitacao_cadastro")`

### 2. Criação do Serviço de Conexão (`PrismaService`)
- [ ] Crie o arquivo `apps/api/zorde-erp-laboratorio/src/infra/database/prisma/prisma.service.ts`:
  - Deve estender `PrismaClient` da biblioteca `@prisma/client`.
  - Implementar o ciclo de vida do NestJS (`OnModuleInit`) para conectar no banco.
  - Implementar hook de intercepção do shutdown (`beforeApplicationShutdown` ou `enableShutdownHooks`) para fechar a conexão de forma segura.

### 3. Criação do Módulo de Banco (`DatabaseModule`)
- [ ] Crie o arquivo `apps/api/zorde-erp-laboratorio/src/infra/database/database.module.ts`:
  - Registrar o `PrismaService` como `provider` e exportá-lo, para que outros módulos possam usá-lo para a persistência.
  - Decorar a classe com `@Global()` para que seja um módulo global de banco de dados no NestJS.

### 4. Validação e Geração do Client
- [ ] Executar o comando de validação do schema e geração do Prisma Client:
  `npx prisma generate` (ou executar dentro do workspace do app `apps/api/zorde-erp-laboratorio`).
- [ ] (Opcional) Executar a criação da migration inicial se um banco PostgreSQL de teste local estiver ativo:
  `npx prisma migrate dev --name init_database`

---

## 🎯 Critérios de Aceitação
1. O arquivo `schema.prisma` deve compilar perfeitamente sem erros de relacionamento ou chaves duplicadas.
2. O Prisma Client deve ser gerado no diretório `node_modules/.prisma` com sucesso.
3. O `DatabaseModule` e o `PrismaService` devem ser importáveis e injetáveis nos providers do NestJS.
