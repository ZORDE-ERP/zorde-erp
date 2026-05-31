# PRD — Zorde Gestão Lab (Laboratório Ótico)

> **Versão:** 1.0 · **Data:** 26/05/2026 · **Status:** Em validação

---

## 1. Visão Geral do Produto

### 1.1 Contexto do Ecossistema

O **Zorde** é um ecossistema SaaS voltado para o **mundo ótico**. O MVP contempla 3 produtos. Este PRD trata do **primeiro produto**: o sistema de gestão para **laboratórios óticos**.

### 1.2 Objetivo do Produto

Permitir que o dono de um laboratório ótico tenha **controle total** sobre:
- **Clientes** (óticas) que enviam pedidos ao laboratório
- **Fornecedores** de insumos (lentes, armações, materiais)
- **Ordens de Serviço** — rastreio de cada trabalho recebido
- **Tabela de Montagem** — preços por tipo de serviço por cliente
- **Usuários** do sistema (operadores/donos)
- **Autenticação e sessões** seguras

### 1.3 Stack Atual (Go) → Migração Planejada (NestJS)

| Aspecto | Go (Atual) | NestJS (Novo) |
|---|---|---|
| Framework HTTP | `net/http` stdlib | NestJS + Express/Fastify |
| ORM | GORM | Prisma / TypeORM |
| Banco | PostgreSQL 16 | PostgreSQL 16 |
| Auth | JWT HS256 + Argon2id | Passport + JWT + Argon2 |
| Validação | go-playground/validator | class-validator + class-transformer |
| Email | Resend SDK | @resend/node |
| Arquitetura | Handler → UseCase → Repository | Controller → Service → Repository |

---

## 2. Arquitetura Atual Mapeada

```
laboratorio-go/
├── cmd/server/main.go          # Entry point — bootstrap + rotas
├── internal/
│   ├── database/database.go    # Conexão + AutoMigrate
│   ├── models/                 # Entidades GORM (7 tabelas)
│   ├── dto/                    # Request/Response DTOs (7 arquivos)
│   ├── repository/             # Interfaces + implementações (7 repos)
│   ├── usecase/                # Lógica de negócio (7 use cases)
│   ├── handler/                # HTTP handlers + middleware (16 arquivos)
│   ├── service/                # Serviços externos (Email/Resend)
│   └── security/               # JWT, Argon2, Fingerprint
├── go.mod / go.sum
├── Dockerfile
└── .air.toml                   # Hot-reload dev
```

### Padrão de Camadas

```mermaid
graph TD
    A["HTTP Request"] --> B["Handler (Controller)"]
    B --> C["Middleware Auth"]
    C --> B
    B --> D["Use Case (Service)"]
    D --> E["Repository"]
    E --> F["PostgreSQL via GORM"]
    D --> G["External Services (Email)"]
    D --> H["Security (JWT/Password)"]
```

---

## 3. Esquema de Banco de Dados

### 3.1 Diagrama ER

```mermaid
erDiagram
    USUARIOS {
        uint id PK "autoIncrement"
        string email UK "NOT NULL"
        string senha "NOT NULL"
        string nome "NOT NULL"
        string documento UK "NOT NULL"
        string contato "NOT NULL"
        timestamp ultimo_acesso "nullable"
        timestamp created_at
        timestamp updated_at "nullable"
    }

    CLIENTES {
        uint id PK "autoIncrement"
        string nome "NOT NULL"
        string email "NOT NULL"
        string contato "nullable"
        varchar20 tipo_pessoa "FISICA | JURIDICA"
        string documento "NOT NULL"
        varchar20 status "ATIVO | INATIVO, default ATIVO"
        string cep "nullable"
        string uf "nullable"
        string cidade "nullable"
        string logradouro "nullable"
        string numero "nullable"
        string bairro "nullable"
        string observacao "nullable"
        uint usuario_id FK "NOT NULL"
        timestamp created_at
        timestamp updated_at "nullable"
        timestamp deleted_at "soft delete"
    }

    FORNECEDORES {
        uint id PK "autoIncrement"
        string nome "NOT NULL"
        string email "NOT NULL"
        string contato "nullable"
        varchar20 tipo_pessoa "FISICA | JURIDICA"
        string documento "NOT NULL"
        varchar20 status "ATIVO | INATIVO, default ATIVO"
        string cep "nullable"
        string uf "nullable"
        string cidade "nullable"
        string logradouro "nullable"
        string numero "nullable"
        string bairro "nullable"
        string observacao "nullable"
        uint usuario_id FK "NOT NULL"
        timestamp created_at
        timestamp updated_at "nullable"
        timestamp deleted_at "soft delete"
    }

    TABELAS_MONTAGEM {
        uint id PK "autoIncrement"
        uint cliente_id FK "NOT NULL"
        varchar50 servico "CHECK enum"
        float64 valor "NOT NULL"
        timestamp created_at
        timestamp updated_at "nullable"
        timestamp deleted_at "soft delete"
    }

    ORDENS_DE_SERVICO {
        uint id PK "autoIncrement"
        string codigo_os "NOT NULL"
        uint cliente_id FK "NOT NULL"
        float64 valor "nullable"
        uint tabela_montagem_id FK "nullable"
        uint usuario_id FK "NOT NULL"
        timestamp created_at
        timestamp updated_at "nullable"
        timestamp deleted_at "soft delete"
    }

    AUTENTICACAO {
        uint id PK "autoIncrement"
        uint id_usuario FK "NOT NULL"
        string refresh_token UK "NOT NULL"
        varchar status "logado | offline"
        string ip "NOT NULL"
        string dispositivo "NOT NULL"
        string navegador "NOT NULL"
        timestamp created_at
        timestamp updated_at "nullable"
    }

    SOLICITACAO_CADASTRO {
        uint id PK "autoIncrement"
        string email UK "NOT NULL"
        varchar6 codigo "NOT NULL"
        timestamp expiracao "NOT NULL"
        timestamp criado_em
    }

    USUARIOS ||--o{ CLIENTES : "possui"
    USUARIOS ||--o{ FORNECEDORES : "possui"
    USUARIOS ||--o{ ORDENS_DE_SERVICO : "cria"
    USUARIOS ||--o{ AUTENTICACAO : "sessoes"
    CLIENTES ||--o{ TABELAS_MONTAGEM : "precos"
    CLIENTES ||--o{ ORDENS_DE_SERVICO : "recebe"
    TABELAS_MONTAGEM ||--o{ ORDENS_DE_SERVICO : "referencia"
```

### 3.2 Enums do Sistema

| Enum | Valores | Uso |
|---|---|---|
| `TipoPessoa` | `FISICA`, `JURIDICA` | Cliente, Fornecedor |
| `StatusPessoa` | `ATIVO`, `INATIVO` | Cliente, Fornecedor |
| `TipoServico` | `MONTAGEM SIMPLES`, `PARAFUSO`, `TRANSPOSICAO`, `COLORACAO`, `SOMENTE ENCAIXAR` | TabelaMontagem |
| `StatusSessao` | `logado`, `offline` | Autenticacao |

### 3.3 Constraints Importantes

- **`usuarios`**: Unique composto em `(email, documento)`
- **`clientes`/`fornecedores`**: CHECK em `tipo_pessoa` e `status`; Soft Delete via `deleted_at`
- **`tabelas_montagem`**: CHECK em `servico` com os 5 tipos válidos; Soft Delete
- **`ordens_de_servico`**: FK `tabela_montagem_id` nullable, ON DELETE SET NULL; Soft Delete
- **`solicitacao_cadastro`**: Unique em `email`

### 3.4 Políticas de FK

| Relação | OnUpdate | OnDelete |
|---|---|---|
| Cliente → Usuario | CASCADE | RESTRICT |
| Fornecedor → Usuario | CASCADE | RESTRICT |
| OrdemDeServico → Cliente | CASCADE | RESTRICT |
| OrdemDeServico → Usuario | CASCADE | RESTRICT |
| OrdemDeServico → TabelaMontagem | CASCADE | SET NULL |
| TabelaMontagem → Cliente | CASCADE | RESTRICT |

---

## 4. API REST — Endpoints

**Base URL:** `http://localhost:8080/api`
**CORS:** Permite `http://localhost:4200` (Angular frontend)

### 4.1 Health Check

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/health` | ❌ | Status do servidor |

**Response:** `{ "status": "ok" }`

---

### 4.2 Autenticação (`/auth`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/auth/login` | ❌ | Login com email/senha |
| `POST` | `/auth/refresh` | ❌ | Renovar access token |
| `POST` | `/auth/logout` | ❌ | Invalidar sessão |
| `POST` | `/auth/solicitar-cadastro` | ❌ | Solicitar código OTP por email |
| `POST` | `/auth/verificar-email` | ❌ | Validar código OTP |
| `POST` | `/auth/reenviar-codigo` | ❌ | Reenviar código OTP |

#### Login
```json
// Request
{ "email": "user@email.com", "senha": "password123" }

// Response 200
{ "access_token": "jwt...", "refresh_token": "jwt..." }
// + Cookie HttpOnly "Fgp" com fingerprint hash
```

#### Refresh
```json
// Request
{ "refresh_token": "jwt..." }

// Response 200
{ "access_token": "new_jwt...", "refresh_token": "new_jwt..." }
```

#### Solicitar Cadastro (OTP)
```json
// Request
{ "email": "novo@email.com" }

// Response 200
{ "message": "Código enviado. Verifique sua caixa de entrada ou a caixa de spam." }
```

#### Verificar Email
```json
// Request
{ "email": "novo@email.com", "codigo": "123456" }

// Response 200
{ "message": "Código confirmado com sucesso." }
```

---

### 4.3 Usuários (`/usuarios`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/usuarios` | ❌ | Criar usuário (registro público) |
| `GET` | `/usuarios` | ✅ | Listar todos os usuários |
| `PUT` | `/usuarios/:id` | ✅ | Atualizar usuário |
| `DELETE` | `/usuarios/:id` | ✅ | Deletar usuário |

#### Criar Usuário
```json
// Request
{
  "email": "user@email.com",
  "senha": "min6chars",
  "nome": "Nome Completo",
  "documento": "12345678900",
  "contato": "11999999999"
}

// Response 201
{
  "id": 1, "email": "...", "nome": "...",
  "documento": "...", "contato": "...",
  "ultimoAcesso": null, "createdAt": "...", "updatedAt": null
}
```

#### Atualizar Usuário
```json
// Request (todos opcionais)
{ "nome": "Novo Nome", "contato": "11888888888", "senha": "novaSenha" }
```

---

### 4.4 Clientes (`/clientes`) — 🔒 Todas protegidas

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/clientes` | ✅ | Listar todos |
| `POST` | `/clientes` | ✅ | Criar cliente |
| `GET` | `/clientes/:id` | ✅ | Buscar por ID |
| `PUT` | `/clientes/:id` | ✅ | Atualizar |
| `DELETE` | `/clientes/:id` | ✅ | Deletar (soft) |

#### Criar/Atualizar Cliente
```json
{
  "nome": "Ótica Central",        // required
  "email": "otica@email.com",     // required, email
  "contato": "11999999999",       // nullable
  "tipoPessoa": "JURIDICA",       // required: FISICA | JURIDICA
  "documento": "12345678000190",  // required
  "status": "ATIVO",              // default ATIVO
  "cep": "01000-000",             // nullable
  "uf": "SP",                     // nullable
  "cidade": "São Paulo",          // nullable
  "logradouro": "Rua X",          // nullable
  "numero": "100",                // nullable
  "bairro": "Centro",             // nullable
  "observacao": "Cliente VIP",    // nullable
  "usuarioId": 1                  // required
}
```

---

### 4.5 Fornecedores (`/fornecedores`) — 🔒 Todas protegidas

Estrutura **idêntica** a Clientes. Mesmos campos, mesmas validações.

| Método | Rota | Auth |
|---|---|---|
| `GET` | `/fornecedores` | ✅ |
| `POST` | `/fornecedores` | ✅ |
| `GET` | `/fornecedores/:id` | ✅ |
| `PUT` | `/fornecedores/:id` | ✅ |
| `DELETE` | `/fornecedores/:id` | ✅ |

---

### 4.6 Ordens de Serviço (`/ordens-de-servico`) — 🔒 Todas protegidas

| Método | Rota | Auth |
|---|---|---|
| `GET` | `/ordens-de-servico` | ✅ |
| `POST` | `/ordens-de-servico` | ✅ |
| `GET` | `/ordens-de-servico/:id` | ✅ |
| `PUT` | `/ordens-de-servico/:id` | ✅ |
| `DELETE` | `/ordens-de-servico/:id` | ✅ |

#### Criar/Atualizar OS
```json
{
  "codigoOS": "OS-2026-001",     // required
  "clienteId": 1,                 // required (validado no BD)
  "valor": 150.00,                // nullable
  "tabelaMontagemId": 3,          // nullable (validado no BD)
  "usuarioId": 1                  // required
}
```

#### Response — com dados aninhados
```json
{
  "id": 1,
  "codigoOS": "OS-2026-001",
  "clienteId": 1,
  "cliente": { "id": 1, "nome": "Ótica Central" },
  "valor": 150.00,
  "tabelaMontagemId": 3,
  "tabelaMontagem": { "id": 3, "servico": "MONTAGEM SIMPLES" },
  "createdAt": "...",
  "updatedAt": null
}
```

> **Regra de negócio:** Na criação/atualização, as relações `clienteId` e `tabelaMontagemId` são **validadas** no banco. Se o cliente ou tabela não existir, retorna erro 422.

---

### 4.7 Tabela de Montagem (`/tabela-montagem`) — 🔒 Todas protegidas

| Método | Rota | Auth |
|---|---|---|
| `GET` | `/tabela-montagem` | ✅ |
| `POST` | `/tabela-montagem` | ✅ |
| `PUT` | `/tabela-montagem/:id` | ✅ |
| `DELETE` | `/tabela-montagem/:id` | ✅ |

#### Listar — com paginação e busca
```
GET /tabela-montagem?page=1&limit=10&search=montagem
```
```json
{
  "items": [
    { "id": 1, "clienteId": 1, "nomeCliente": "Ótica Central",
      "servico": "MONTAGEM SIMPLES", "valor": 25.00,
      "createdAt": "...", "updatedAt": null }
  ],
  "total": 1
}
```

#### Criar/Atualizar
```json
{
  "clienteId": 1,                      // required
  "servico": "MONTAGEM SIMPLES",       // required, enum validado
  "valor": 25.00                       // required, > 0
}
```

---

## 5. Segurança e Autenticação

### 5.1 Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant C as Frontend
    participant S as Backend
    participant DB as PostgreSQL

    C->>S: POST /auth/login {email, senha}
    S->>DB: Buscar usuário por email
    S->>S: Verificar senha (Argon2id)
    S->>S: Gerar fingerprint = SHA256(IP + UserAgent)
    S->>S: Gerar access_token (12h) + refresh_token (24h)
    S->>DB: Salvar sessão em 'autenticacao'
    S->>DB: Atualizar ultimo_acesso do usuário
    S-->>C: {access_token, refresh_token} + Cookie "Fgp"

    Note over C,S: Requests autenticados

    C->>S: GET /api/clientes (Authorization: Bearer <token>)
    S->>S: Validar JWT
    S->>S: Validar cookie Fgp == SHA256(IP+UA)
    S->>S: Validar claims.fingerprint == esperado
    S-->>C: 200 OK [dados]
```

### 5.2 JWT — Claims Customizados

```json
{
  "sub": "1",                    // User ID (string)
  "nome": "Nome do Usuário",
  "email": "user@email.com",
  "fingerprint": "sha256hash...",
  "exp": 1716777600,             // 12h (access) ou 24h (refresh)
  "iat": 1716734400
}
```

### 5.3 Hashing de Senha — Argon2id

| Parâmetro | Valor |
|---|---|
| Tempo | 3 iterações |
| Memória | 64 MB |
| Threads | 4 |
| Key Length | 32 bytes |
| Salt Length | 16 bytes |
| Formato | `$argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>` |

### 5.4 Fingerprint (Anti-CSRF)

- **Geração:** `SHA256(IP + "|" + UserAgent)`
- **Armazenamento:** Cookie HttpOnly `Fgp` (ou `__Secure-Fgp` em produção)
- **Validação tripla:** Cookie == Expected == JWT Claims

### 5.5 Middleware de Autenticação

Aplicado em todas as rotas protegidas (🔒). Validações em ordem:
1. Header `Authorization: Bearer <token>` presente
2. JWT válido e não expirado
3. Cookie `Fgp` presente
4. `cookie.value == SHA256(IP+UA) == claims.fingerprint`

---

## 6. Fluxo de Cadastro (Verificação por Email)

```mermaid
sequenceDiagram
    participant C as Frontend
    participant S as Backend
    participant E as Resend API

    C->>S: POST /auth/solicitar-cadastro {email}
    S->>S: Gerar OTP 6 dígitos (crypto/rand)
    S->>DB: Deletar solicitação anterior (se existir)
    S->>DB: Salvar {email, código, expiração: +5min}
    S->>E: Enviar email com código
    S-->>C: "Código enviado"

    C->>S: POST /auth/verificar-email {email, codigo}
    S->>DB: Buscar solicitação por email
    S->>S: Validar: não expirado + código correto
    S->>DB: Deletar solicitação
    S-->>C: "Código confirmado"

    C->>S: POST /usuarios {email, senha, nome, ...}
    S-->>C: 201 Usuário criado
```

### Regras de Negócio do OTP
- Código: 6 dígitos numéricos, gerado com `crypto/rand`
- Expiração: **5 minutos**
- Reenvio: cooldown de **30 segundos** entre reenvios
- Limpeza: código deletado após verificação ou expiração

---

## 7. Serviço de Email

- **Provider:** Resend (`resend.com`)
- **Remetente:** `Zorde Gestão <send@zorde.com.br>`
- **Template:** HTML inline com design dark mode (cores `#0f172a`, `#1e293b`, `#38bdf8`)
- **Conteúdo:** Código OTP com destaque visual, aviso de expiração de 5 min

---

## 8. Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | Connection string PostgreSQL | `postgres://user:pass@localhost:5432/db?sslmode=disable` |
| `POSTGRES_DB` | Nome do banco | `zorde_gestao_lab` |
| `POSTGRES_USER` | Usuário do banco | `zorde_lab` |
| `POSTGRES_PASSWORD` | Senha do banco | `***` |
| `API_PORT` | Porta da API | `8080` |
| `RESEND_API_KEY` | Chave da API Resend | `re_***` |
| `JWT_SECRET` | Segredo para assinatura JWT | `super_secret_key` |
| `APP_ENV` | Ambiente (afeta cookie Secure) | `production` ou vazio |

---

## 9. Infraestrutura

### Docker Compose
- **postgres**: PostgreSQL 16 Alpine com healthcheck
- **api**: Build do Dockerfile Go, depende do postgres healthy
- Volume persistente: `postgres_data`

### Monorepo (Turborepo)
```
zorde-repo/
├── apps/
│   ├── api/laboratorio-go/    ← ESTE PRODUTO (backend Go)
│   ├── app/                   ← Frontend(s)
│   └── docs/                  ← Documentação
├── packages/                  ← Libs compartilhadas
├── docker-compose.yaml
└── turbo.json
```

---

## 10. Testes Existentes

O projeto possui testes unitários e de handler:

| Camada | Arquivos | Cobertura |
|---|---|---|
| Use Cases | `cliente_usecase_test.go`, `fornecedor_usecase_test.go`, `ordem_de_servico_usecase_test.go`, `solicitacao_cadastro_usecase_test.go`, `usuario_usecase_test.go` | Regras de negócio |
| Handlers | `cliente_handler_test.go`, `fornecedor_handler_test.go`, `ordem_de_servico_handler_test.go`, `tabela_montagem_handler_test.go` | HTTP layer |
| Security | `jwt_test.go`, `fingerprint_test.go`, `auth_middleware_test.go`, `autenticacao_handler_test.go` | Auth |

---

## 11. Resumo para Migração NestJS

### 11.1 Módulos NestJS Necessários

| Módulo | Responsabilidade |
|---|---|
| `AuthModule` | Login, Refresh, Logout, Guards, JWT Strategy |
| `UsuarioModule` | CRUD de usuários, hash de senha |
| `ClienteModule` | CRUD de clientes (óticas) |
| `FornecedorModule` | CRUD de fornecedores |
| `OrdemDeServicoModule` | CRUD de OS com validação de relações |
| `TabelaMontagemModule` | CRUD com paginação/busca |
| `SolicitacaoCadastroModule` | Fluxo OTP de verificação de email |
| `EmailModule` | Integração com Resend |
| `DatabaseModule` | Configuração Prisma/TypeORM |

### 11.2 Checklist de Paridade Funcional

- [ ] 7 tabelas PostgreSQL com mesmos constraints
- [ ] 28 endpoints REST com mesmos contratos JSON
- [ ] Autenticação JWT (12h access / 24h refresh) + Fingerprint cookie
- [ ] Hashing Argon2id com mesmos parâmetros
- [ ] Validação de DTOs com class-validator
- [ ] Soft delete em Cliente, Fornecedor, TabelaMontagem, OrdemDeServico
- [ ] Paginação + busca na TabelaMontagem
- [ ] Validação de relações na criação/update de OS
- [ ] Fluxo OTP: geração, envio email, verificação, cooldown 30s
- [ ] CORS configurado para frontend Angular
- [ ] Tratamento de erros com códigos HTTP consistentes
- [ ] Testes unitários e e2e equivalentes
