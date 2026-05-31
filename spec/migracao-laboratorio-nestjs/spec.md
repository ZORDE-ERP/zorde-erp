# Spec — Migração Laboratorio-Go → NestJS (Clean Architecture)

> **Origem:** `apps/api/laboratorio-go` (Go + GORM + net/http)
> **Destino:** `apps/api/laboratorio` (NestJS + Prisma + TypeScript)
> **Arquitetura de referência:** `docs/ARCHITECTURE.MD`

---

## 1. Models (Tabelas do Banco de Dados)

### 1.1 `Usuario` — tabela `usuarios`

| Coluna         | Tipo Go         | Tipo Prisma / TS        | Constraints                                      |
|----------------|-----------------|-------------------------|--------------------------------------------------|
| id             | `uint`          | `Int @id @default(autoincrement())` | PK, auto-increment                    |
| email          | `string`        | `String @unique`        | NOT NULL, unique (composto com documento)         |
| senha          | `string`        | `String`                | NOT NULL (hash Argon2id)                          |
| nome           | `string`        | `String`                | NOT NULL                                          |
| documento      | `string`        | `String @unique`        | NOT NULL, unique (composto com email)             |
| contato        | `string`        | `String`                | NOT NULL                                          |
| ultimo_acesso  | `*time.Time`    | `DateTime?`             | Nullable                                          |
| created_at     | `time.Time`     | `DateTime @default(now())` | Auto                                           |
| updated_at     | `*time.Time`    | `DateTime? @updatedAt`  | Auto                                              |

**Índice único composto:** `@@unique([email, documento], name: "uni_usuario_email_documento")`

---

### 1.2 `Autenticacao` — tabela `autenticacao`

| Coluna         | Tipo Go         | Tipo Prisma / TS        | Constraints                                      |
|----------------|-----------------|-------------------------|--------------------------------------------------|
| id             | `uint`          | `Int @id @default(autoincrement())` | PK                                    |
| id_usuario     | `uint`          | `Int`                   | NOT NULL, FK → `usuarios.id`                      |
| refresh_token  | `string`        | `String @unique`        | NOT NULL, unique index                            |
| status         | `StatusSessao`  | `String @default("logado")` | NOT NULL, enum: `logado`, `offline`           |
| ip             | `string`        | `String`                | NOT NULL                                          |
| dispositivo    | `string`        | `String`                | NOT NULL                                          |
| navegador      | `string`        | `String`                | NOT NULL                                          |
| created_at     | `time.Time`     | `DateTime @default(now())` | Auto                                           |
| updated_at     | `*time.Time`    | `DateTime? @updatedAt`  | Auto                                              |

**Relação:** `usuario Usuario @relation(fields: [id_usuario], references: [id])`

---

### 1.3 `Cliente` — tabela `clientes`

| Coluna         | Tipo Go          | Tipo Prisma / TS       | Constraints                                      |
|----------------|------------------|------------------------|--------------------------------------------------|
| id             | `uint`           | `Int @id @default(autoincrement())` | PK                                  |
| nome           | `string`         | `String`               | NOT NULL                                          |
| email          | `string`         | `String`               | NOT NULL                                          |
| contato        | `*string`        | `String?`              | Nullable                                          |
| tipo_pessoa    | `TipoPessoa`     | `String`               | NOT NULL, check: `FISICA` \| `JURIDICA`           |
| documento      | `string`         | `String`               | NOT NULL                                          |
| status         | `StatusPessoa`   | `String @default("ATIVO")` | NOT NULL, check: `ATIVO` \| `INATIVO`         |
| cep            | `*string`        | `String?`              | Nullable                                          |
| uf             | `*string`        | `String?`              | Nullable                                          |
| cidade         | `*string`        | `String?`              | Nullable                                          |
| logradouro     | `*string`        | `String?`              | Nullable                                          |
| numero         | `*string`        | `String?`              | Nullable                                          |
| bairro         | `*string`        | `String?`              | Nullable                                          |
| observacao     | `*string`        | `String?`              | Nullable                                          |
| usuario_id     | `uint`           | `Int`                  | NOT NULL, FK → `usuarios.id`                      |
| created_at     | `time.Time`      | `DateTime @default(now())` | Auto                                          |
| updated_at     | `*time.Time`     | `DateTime? @updatedAt` | Auto                                              |
| deleted_at     | `gorm.DeletedAt` | `DateTime?`            | Soft delete (index)                               |

**Relações:** FK `usuario_id` → `usuarios.id` (CASCADE update, RESTRICT delete)

---

### 1.4 `Fornecedor` — tabela `fornecedores`

| Coluna         | Tipo Go          | Tipo Prisma / TS       | Constraints                                      |
|----------------|------------------|------------------------|--------------------------------------------------|
| id             | `uint`           | `Int @id @default(autoincrement())` | PK                                  |
| nome           | `string`         | `String`               | NOT NULL                                          |
| email          | `string`         | `String`               | NOT NULL                                          |
| contato        | `*string`        | `String?`              | Nullable                                          |
| tipo_pessoa    | `TipoPessoa`     | `String`               | NOT NULL, check: `FISICA` \| `JURIDICA`           |
| documento      | `string`         | `String`               | NOT NULL                                          |
| status         | `StatusPessoa`   | `String @default("ATIVO")` | NOT NULL, check: `ATIVO` \| `INATIVO`         |
| cep            | `*string`        | `String?`              | Nullable                                          |
| uf             | `*string`        | `String?`              | Nullable                                          |
| cidade         | `*string`        | `String?`              | Nullable                                          |
| logradouro     | `*string`        | `String?`              | Nullable                                          |
| numero         | `*string`        | `String?`              | Nullable                                          |
| bairro         | `*string`        | `String?`              | Nullable                                          |
| observacao     | `*string`        | `String?`              | Nullable                                          |
| usuario_id     | `uint`           | `Int`                  | NOT NULL, FK → `usuarios.id`                      |
| created_at     | `time.Time`      | `DateTime @default(now())` | Auto                                          |
| updated_at     | `*time.Time`     | `DateTime? @updatedAt` | Auto                                              |
| deleted_at     | `gorm.DeletedAt` | `DateTime?`            | Soft delete (index)                               |

**Relações:** FK `usuario_id` → `usuarios.id` (CASCADE update, RESTRICT delete)

---

### 1.5 `TabelaMontagem` — tabela `tabelas_montagem`

| Coluna         | Tipo Go          | Tipo Prisma / TS       | Constraints                                      |
|----------------|------------------|------------------------|--------------------------------------------------|
| id             | `uint`           | `Int @id @default(autoincrement())` | PK                                  |
| cliente_id     | `uint`           | `Int`                  | NOT NULL, FK → `clientes.id`                      |
| servico        | `TipoServico`    | `String`               | NOT NULL, check enum (ver abaixo)                 |
| valor          | `float64`        | `Float`                | NOT NULL                                          |
| created_at     | `time.Time`      | `DateTime @default(now())` | Auto                                          |
| updated_at     | `*time.Time`     | `DateTime? @updatedAt` | Auto                                              |
| deleted_at     | `gorm.DeletedAt` | `DateTime?`            | Soft delete (index)                               |

**Valores de `servico`:** `MONTAGEM SIMPLES`, `PARAFUSO`, `TRANSPOSICAO`, `COLORACAO`, `SOMENTE ENCAIXAR`

---

### 1.6 `OrdemDeServico` — tabela `ordens_de_servico`

| Coluna            | Tipo Go          | Tipo Prisma / TS       | Constraints                                   |
|-------------------|------------------|------------------------|-----------------------------------------------|
| id                | `uint`           | `Int @id @default(autoincrement())` | PK                               |
| codigo_os         | `string`         | `String`               | NOT NULL                                       |
| cliente_id        | `uint`           | `Int`                  | NOT NULL, FK → `clientes.id`                   |
| valor             | `*float64`       | `Float?`               | Nullable                                       |
| tabela_montagem_id| `*uint`          | `Int?`                 | Nullable, FK → `tabelas_montagem.id`           |
| usuario_id        | `uint`           | `Int`                  | NOT NULL, FK → `usuarios.id`                   |
| created_at        | `time.Time`      | `DateTime @default(now())` | Auto                                       |
| updated_at        | `*time.Time`     | `DateTime? @updatedAt` | Auto                                           |
| deleted_at        | `gorm.DeletedAt` | `DateTime?`            | Soft delete (index)                            |

**Relações:**
- FK `cliente_id` → `clientes.id` (CASCADE update, RESTRICT delete)
- FK `tabela_montagem_id` → `tabelas_montagem.id` (CASCADE update, SET NULL delete)
- FK `usuario_id` → `usuarios.id` (CASCADE update, RESTRICT delete)

---

### 1.7 `SolicitacaoCadastro` — tabela `solicitacao_cadastro`

| Coluna         | Tipo Go       | Tipo Prisma / TS       | Constraints                                      |
|----------------|---------------|------------------------|--------------------------------------------------|
| id             | `uint`        | `Int @id @default(autoincrement())` | PK                                    |
| email          | `string`      | `String @unique`       | NOT NULL, unique index                            |
| codigo         | `string`      | `String @db.VarChar(6)`| NOT NULL, 6 chars (OTP)                           |
| expiracao      | `time.Time`   | `DateTime`             | NOT NULL                                          |
| criado_em      | `time.Time`   | `DateTime @default(now())` | NOT NULL, auto                                |

---

## 2. Enums

```typescript
// src/shared/enums/tipo-pessoa.enum.ts
export enum TipoPessoa {
  FISICA = 'FISICA',
  JURIDICA = 'JURIDICA',
}

// src/shared/enums/status-pessoa.enum.ts
export enum StatusPessoa {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}

// src/shared/enums/tipo-servico.enum.ts
export enum TipoServico {
  MONTAGEM_SIMPLES = 'MONTAGEM SIMPLES',
  PARAFUSO = 'PARAFUSO',
  TRANSPOSICAO = 'TRANSPOSICAO',
  COLORACAO = 'COLORACAO',
  SOMENTE_ENCAIXAR = 'SOMENTE ENCAIXAR',
}

// src/shared/enums/status-sessao.enum.ts
export enum StatusSessao {
  LOGADO = 'logado',
  OFFLINE = 'offline',
}
```

---

## 3. Módulos NestJS (seguindo `docs/ARCHITECTURE.MD`)

### 3.1 Módulo `auth`

**Responsabilidade:** Login, JWT (access + refresh), fingerprint cookie, logout, guards.

**Estrutura:**
```
modules/auth/
├── auth.module.ts
├── domain/
│   ├── entities/autenticacao.entity.ts
│   └── repositories/iautenticacao.repository.ts
├── application/
│   ├── services/auth.service.ts
│   ├── use-cases/
│   │   ├── login.use-case.ts
│   │   ├── refresh-token.use-case.ts
│   │   └── logout.use-case.ts
│   └── dtos/
│       ├── login.dto.ts
│       └── auth-response.dto.ts
├── infra/
│   └── repositories/prisma-autenticacao.repository.ts
└── presentation/
    └── controllers/auth.controller.ts
```

**Rotas (públicas):**
| Método | Rota                  | Use Case           |
|--------|-----------------------|--------------------|
| POST   | `/api/auth/login`     | `LoginUseCase`     |
| POST   | `/api/auth/refresh`   | `RefreshTokenUseCase` |
| POST   | `/api/auth/logout`    | `LogoutUseCase`    |

**Segurança implementada no Go (manter paridade):**
- Hash de senha: **Argon2id** (time=3, memory=64MB, threads=4, keyLen=32)
- JWT: **HS256**, access token 12h, refresh token 24h
- Claims: `sub` (userId), `nome`, `email`, `fingerprint`
- Fingerprint: SHA-256 de `IP|UserAgent`, enviado via cookie HttpOnly (`Fgp` / `__Secure-Fgp`)
- Middleware valida: Bearer token + cookie fingerprint + IP/UA match

---

### 3.2 Módulo `usuario`

**Responsabilidade:** CRUD de usuários internos.

**Estrutura:**
```
modules/usuario/
├── usuario.module.ts
├── domain/
│   ├── entities/usuario.entity.ts
│   └── repositories/i-usuario.repository.ts
├── application/
│   ├── services/usuario.service.ts
│   ├── use-cases/
│   │   ├── criar-usuario.use-case.ts
│   │   ├── listar-usuarios.use-case.ts
│   │   ├── atualizar-usuario.use-case.ts
│   │   └── deletar-usuario.use-case.ts
│   └── dtos/
│       ├── criar-usuario.dto.ts
│       ├── atualizar-usuario.dto.ts
│       └── usuario-response.dto.ts
├── infra/
│   └── repositories/prisma-usuario.repository.ts
└── presentation/
    └── controllers/usuario.controller.ts
```

**Rotas:**
| Método | Rota               | Auth? | Use Case               |
|--------|--------------------|-------|------------------------|
| POST   | `/api/usuarios`    | ❌    | `CriarUsuarioUseCase`  |
| GET    | `/api/usuarios`    | ✅    | `ListarUsuariosUseCase`|
| PUT    | `/api/usuarios/:id`| ✅    | `AtualizarUsuarioUseCase`|
| DELETE | `/api/usuarios/:id`| ✅    | `DeletarUsuarioUseCase`|

**Regras de negócio:**
- Senha é hashada com Argon2id antes de persistir
- Validação de unicidade de email + documento (erro 409)
- Update parcial (só campos enviados)

---

### 3.3 Módulo `cliente`

**Responsabilidade:** CRUD de clientes PF/PJ.

**Estrutura:** mesmo padrão do módulo `usuario`.

**Rotas (todas protegidas):**
| Método | Rota                | Use Case               |
|--------|---------------------|------------------------|
| GET    | `/api/clientes`     | `ListarClientesUseCase`|
| POST   | `/api/clientes`     | `CriarClienteUseCase`  |
| GET    | `/api/clientes/:id` | `BuscarClienteUseCase` |
| PUT    | `/api/clientes/:id` | `AtualizarClienteUseCase`|
| DELETE | `/api/clientes/:id` | `DeletarClienteUseCase`|

**Regras:** soft delete via `deleted_at`, status default `ATIVO`.

---

### 3.4 Módulo `fornecedor`

**Responsabilidade:** CRUD de fornecedores (mesma estrutura de Cliente).

**Rotas (todas protegidas):**
| Método | Rota                    | Use Case                   |
|--------|-------------------------|----------------------------|
| GET    | `/api/fornecedores`     | `ListarFornecedoresUseCase`|
| POST   | `/api/fornecedores`     | `CriarFornecedorUseCase`   |
| GET    | `/api/fornecedores/:id` | `BuscarFornecedorUseCase`  |
| PUT    | `/api/fornecedores/:id` | `AtualizarFornecedorUseCase`|
| DELETE | `/api/fornecedores/:id` | `DeletarFornecedorUseCase` |

---

### 3.5 Módulo `tabela-servico` (TabelaMontagem)

**Responsabilidade:** Catálogo de serviços com preços por cliente.

**Rotas (todas protegidas):**
| Método | Rota                       | Use Case                     |
|--------|----------------------------|------------------------------|
| GET    | `/api/tabela-montagem`     | `ListarTabelaMontagemUseCase`|
| POST   | `/api/tabela-montagem`     | `CriarTabelaMontagemUseCase` |
| PUT    | `/api/tabela-montagem/:id` | `AtualizarTabelaMontagemUseCase`|
| DELETE | `/api/tabela-montagem/:id` | `DeletarTabelaMontagemUseCase`|

**Regras:**
- Paginação: `page`, `limit`, `search` (query params)
- Search filtra por `cliente.nome` ou `servico` (ILIKE)
- Validação de `TipoServico` enum
- Response inclui `nomeCliente` (join com Cliente)

---

### 3.6 Módulo `ordem-servico`

**Responsabilidade:** Ciclo de vida de ordens de serviço.

**Rotas (todas protegidas):**
| Método | Rota                          | Use Case                     |
|--------|-------------------------------|------------------------------|
| GET    | `/api/ordens-de-servico`      | `ListarOrdensUseCase`        |
| POST   | `/api/ordens-de-servico`      | `CriarOrdemUseCase`          |
| GET    | `/api/ordens-de-servico/:id`  | `BuscarOrdemUseCase`         |
| PUT    | `/api/ordens-de-servico/:id`  | `AtualizarOrdemUseCase`      |
| DELETE | `/api/ordens-de-servico/:id`  | `DeletarOrdemUseCase`        |

**Regras:**
- Valida existência de `clienteId` e `tabelaMontagemId` antes de criar/atualizar
- Response inclui `cliente { id, nome }` e `tabelaMontagem { id, servico }`
- Soft delete

---

### 3.7 Módulo `solicitacao-cadastro`

**Responsabilidade:** Verificação de email via OTP (6 dígitos) com Resend.

**Rotas (públicas):**
| Método | Rota                             | Use Case                        |
|--------|----------------------------------|---------------------------------|
| POST   | `/api/auth/solicitar-cadastro`   | `SolicitarCadastroUseCase`      |
| POST   | `/api/auth/verificar-email`      | `VerificarEmailUseCase`         |
| POST   | `/api/auth/reenviar-codigo`      | `ReenviarCodigoUseCase`         |

**Regras:**
- Gera OTP de 6 dígitos (crypto random)
- Expira em 5 minutos
- Cooldown de 30s para reenvio
- Envia email via Resend API com template HTML
- Deleta registro após verificação bem-sucedida

---

## 4. Camada Shared

```
src/shared/
├── errors/
│   ├── app.exception.ts          # Exception base de domínio
│   └── http-exception.filter.ts  # Filtro global NestJS
├── decorators/
│   └── current-user.decorator.ts # Extrai user do JWT
├── guards/
│   └── jwt-auth.guard.ts         # Guard + fingerprint validation
├── pipes/
│   └── zod-validation.pipe.ts    # ZodValidationPipe customizado
└── enums/
    ├── tipo-pessoa.enum.ts
    ├── status-pessoa.enum.ts
    ├── tipo-servico.enum.ts
    └── status-sessao.enum.ts
```

---

## 5. Infraestrutura (Prisma)

```
src/infra/
├── database/
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── database.module.ts
└── http/
    └── http.module.ts
```

---

## 6. Variáveis de Ambiente

```env
# Banco de dados
DATABASE_URL=postgres://user:password@postgres:5432/zorde_lab?sslmode=disable
POSTGRES_DB=zorde_lab
POSTGRES_USER=zorde
POSTGRES_PASSWORD=secret

# API
API_PORT=3000

# Auth
JWT_SECRET=your-jwt-secret
APP_ENV=development

# Email
RESEND_API_KEY=re_xxxxxxxxxxxx
```

---

## 7. Docker — Containers

### 7.1 `Dockerfile` — `apps/api/laboratorio/Dockerfile`

```dockerfile
# Stage 1: Dependencies
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production && cp -R node_modules /prod_modules
RUN npm ci

# Stage 2: Build
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Production
FROM node:24-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

COPY --from=deps /prod_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

USER nestjs
EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### 7.2 `docker-compose.yaml` — Raiz do monorepo

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: zorde_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ./apps/api/laboratorio
      dockerfile: Dockerfile
    container_name: zorde_api
    restart: unless-stopped
    environment:
      PORT: ${API_PORT:-3000}
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?sslmode=disable
      RESEND_API_KEY: ${RESEND_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
      APP_ENV: ${APP_ENV:-development}
    ports:
      - "${API_PORT:-3000}:${API_PORT:-3000}"
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
```

---

## 8. Estrutura Final do Projeto NestJS

```
apps/api/laboratorio/
├── Dockerfile
├── package.json
├── tsconfig.json
├── nest-cli.json
├── prisma/
│   └── schema.prisma
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   ├── env.validation.ts
│   │   └── database.config.ts
│   ├── shared/
│   │   ├── errors/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── pipes/
│   │   └── enums/
│   ├── modules/
│   │   ├── auth/
│   │   ├── usuario/
│   │   ├── cliente/
│   │   ├── fornecedor/
│   │   ├── tabela-servico/
│   │   ├── ordem-servico/
│   │   └── solicitacao-cadastro/
│   └── infra/
│       ├── database/
│       │   ├── prisma/
│       │   │   ├── prisma.service.ts
│       │   │   └── migrations/
│       │   └── database.module.ts
│       └── http/
│           └── http.module.ts
└── test/
    ├── unit/
    └── e2e/
```

---

## 9. Mapeamento Go → NestJS (Resumo por Camada)

| Camada Go          | Equivalente NestJS                              |
|--------------------|--------------------------------------------------|
| `models/`          | `domain/entities/` (classes puras, sem ORM)      |
| `repository/` (interface) | `domain/repositories/i-*.repository.ts`   |
| `repository/` (impl)      | `infra/repositories/prisma-*.repository.ts`|
| `usecase/`         | `application/use-cases/`                         |
| `dto/`             | `application/dtos/` (schemas Zod)                |
| `handler/`         | `presentation/controllers/`                      |
| `handler/helpers.go` | `shared/pipes/zod-validation.pipe.ts`          |
| `handler/auth_middleware.go` | `shared/guards/jwt-auth.guard.ts`      |
| `security/jwt.go`  | NestJS `@nestjs/jwt` + `@nestjs/passport`        |
| `security/password.go` | Serviço interno com `argon2` (npm)           |
| `security/fingerprint.go` | Util em `shared/` com `crypto` nativo    |
| `service/email_service.go` | `shared/services/email.service.ts` (Resend)|
| `database/database.go` | `infra/database/prisma/prisma.service.ts`    |

---

## 10. Ordem de Implementação (Tasks)

1. **Scaffold do projeto NestJS** — `npx @nestjs/cli new`
2. **Configurar Prisma** — `schema.prisma` com todos os models acima
3. **Shared layer** — guards, pipes, decorators, enums, exceptions
4. **Módulo `auth`** — JWT, Argon2, fingerprint, login/refresh/logout
5. **Módulo `usuario`** — CRUD completo
6. **Módulo `solicitacao-cadastro`** — OTP + Resend email
7. **Módulo `cliente`** — CRUD com soft delete
8. **Módulo `fornecedor`** — CRUD com soft delete
9. **Módulo `tabela-servico`** — CRUD com paginação e search
10. **Módulo `ordem-servico`** — CRUD com validação de relações
11. **Docker** — Dockerfile + docker-compose.yaml
12. **Testes** — unit + e2e

---

## 11. Dependências NPM Necessárias

```json
{
  "dependencies": {
    "@nestjs/common": "^11.x",
    "@nestjs/core": "^11.x",
    "@nestjs/platform-express": "^11.x",
    "@nestjs/jwt": "^11.x",
    "@nestjs/passport": "^11.x",
    "@nestjs/config": "^4.x",
    "@prisma/client": "^6.x",
    "passport": "^0.7.x",
    "passport-jwt": "^4.x",
    "argon2": "^0.41.x",
    "zod": "^3.x",
    "resend": "^4.x",
    "class-transformer": "^0.5.x"
  },
  "devDependencies": {
    "prisma": "^6.x",
    "@nestjs/cli": "^11.x",
    "@nestjs/testing": "^11.x",
    "jest": "^29.x",
    "ts-jest": "^29.x",
    "typescript": "^5.x"
  }
}
```
