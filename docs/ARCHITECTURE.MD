---
name: nestjs-clean-architecture
description: >
  Arquitetura modular com Clean Architecture para aplicações NestJS + TypeScript.
  Use esta skill sempre que o usuário pedir para criar, estruturar, scaffoldar ou
  organizar um projeto NestJS — mesmo que não cite explicitamente "Clean Architecture".
  Cobre: geração de módulos (auth, cliente, fornecedor, tabela de serviço, ordem de
  serviço, dashboard, usuário), separação de camadas (controller → use-case →
  repository → entity), injeção de dependência com tokens, schemas e DTOs com Zod,
  ZodValidationPipe customizado, interfaces de repositório com implementação Prisma, e boas práticas de
  organização de pastas. Trigger obrigatório ao mencionar NestJS com qualquer um
  destes termos: módulo, camada, use-case, repositório, controller, serviço, entidade,
  arquitetura, scaffolding, pasta, estrutura de projeto.
---

# NestJS Clean Architecture — Skill

## Visão Geral

Esta skill define a estrutura canônica de um projeto NestJS seguindo **Clean Architecture**,
com separação rígida de camadas e inversão de dependência. O agente deve ler este arquivo
inteiro antes de gerar qualquer código ou estrutura de pastas.

---

## Princípios Fundamentais

1. **Camadas isoladas** — Domain nunca importa Infrastructure; Application nunca importa Framework.
2. **Inversão de dependência** — Use-cases dependem de interfaces (portas), não de implementações.
3. **Um módulo = um contexto de negócio** — cada pasta de módulo é auto-contida.
4. **Sem lógica nos Controllers** — controllers só validam input, chamam use-case e formatam output.
5. **Sem lógica nos Repositories** — repositories só persistem/consultam dados, sem regra de negócio.

---

## Estrutura Raiz do Projeto

```
src/
├── main.ts
├── app.module.ts
├── config/                        # Variáveis de ambiente e configuração global
│   ├── env.validation.ts
│   └── database.config.ts
├── shared/                        # Utilitários compartilhados entre módulos
│   ├── errors/
│   │   ├── app.exception.ts
│   │   └── http-exception.filter.ts
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── pipes/
│       └── zod-validation.pipe.ts
├── modules/
│   ├── auth/
│   ├── usuario/
│   ├── cliente/
│   ├── fornecedor/
│   ├── tabela-servico/
│   ├── ordem-servico/
│   └── dashboard/
└── infra/
    ├── database/
    │   ├── prisma/
    │   │   ├── prisma.service.ts
    │   │   └── migrations/
    │   └── database.module.ts
    └── http/
        └── http.module.ts
```

---

## Anatomia de um Módulo

Cada módulo em `src/modules/<nome>/` segue **exatamente** esta estrutura interna:

```
modules/<nome>/
├── <nome>.module.ts                  # NestJS module — registra providers e exports
│
├── domain/                           # CAMADA DE DOMÍNIO — zero dependência de framework
│   ├── entities/
│   │   └── <nome>.entity.ts          # Classe de domínio pura (sem decorators ORM)
│   └── repositories/
│       └── i-<nome>.repository.ts    # Interface (porta) do repositório
│
├── application/                      # CAMADA DE APLICAÇÃO — orquestra use-cases
│   ├── services/
│   │   └── <nome>.service.ts         # Fachada: ponto de entrada único para o controller
│   ├── use-cases/
│   │   ├── criar-<nome>.use-case.ts
│   │   ├── buscar-<nome>.use-case.ts
│   │   ├── listar-<nome>.use-case.ts
│   │   ├── atualizar-<nome>.use-case.ts
│   │   └── deletar-<nome>.use-case.ts
│   └── dtos/
│       ├── criar-<nome>.dto.ts
│       ├── atualizar-<nome>.dto.ts
│       └── <nome>-response.dto.ts
│
├── infra/                            # CAMADA DE INFRAESTRUTURA — detalhes de persistência
│   └── repositories/
│       └── prisma-<nome>.repository.ts  # Implementação concreta com Prisma
│
└── presentation/                     # CAMADA DE APRESENTAÇÃO — HTTP/interface externa
    └── controllers/
        └── <nome>.controller.ts
```

> **Ler os arquivos de referência** para exemplos de código completos por módulo:
> - `references/layer-patterns.md` — padrões de cada camada com código TypeScript
> - `references/modules/` — implementação completa de cada módulo do MVP

---

## Tokens de Injeção de Dependência

Use tokens string/symbol para desacoplar interfaces de implementações:

```typescript
// Em cada domain/repositories/i-<nome>.repository.ts
export const ICLIENTE_REPOSITORY = 'IClienteRepository';
```

```typescript
// Em <nome>.module.ts — registra implementação concreta
providers: [
  {
    provide: ICLIENTE_REPOSITORY,
    useClass: PrismaClienteRepository,
  },
  CriarClienteUseCase,
],
```

```typescript
// No use-case — injeta pela interface
constructor(
  @Inject(ICLIENTE_REPOSITORY)
  private readonly clienteRepository: IClienteRepository,
) {}
```

---

## Módulos do MVP e Responsabilidades

| Módulo           | Responsabilidade principal                                    |
|------------------|---------------------------------------------------------------|
| `auth`           | Login, JWT, refresh token, guards                             |
| `usuario`        | CRUD de usuários internos do sistema                          |
| `cliente`        | CRUD de clientes pessoas físicas/jurídicas                    |
| `fornecedor`     | CRUD de fornecedores de materiais/serviços                    |
| `tabela-servico` | Catálogo de serviços com preços base                          |
| `ordem-servico`  | Ciclo de vida completo de ordens (abertura → conclusão)       |
| `dashboard`      | Agregações e métricas de leitura (somente queries)            |

---

## Regras de Dependência Entre Módulos

```
presentation  →  application  →  domain  ←  (nenhum)
                                    ↑
                              infra implementa
```

- `ordem-servico` pode importar `ClienteModule` e `TabelaServicoModule` para injetar repositórios.
- `dashboard` importa repositórios de leitura de múltiplos módulos (read-only).
- `auth` exporta `JwtAuthGuard` e `CurrentUserDecorator` para uso em `shared/`.
- Módulos **nunca** importam diretamente a implementação concreta de outro módulo — apenas a interface exportada.

---

## Convenções de Nomenclatura

| Artefato              | Padrão                              | Exemplo                         |
|-----------------------|-------------------------------------|---------------------------------|
| Entity                | `<Nome>Entity`                      | `ClienteEntity`                 |
| Interface repositório | `I<Nome>Repository`                 | `IClienteRepository`            |
| Token DI              | `I_<NOME>_REPOSITORY`               | `ICLIENTE_REPOSITORY`          |
| Use-case              | `<Verbo><Nome>UseCase`              | `CriarClienteUseCase`           |
| DTO entrada           | `Criar<Nome>Dto` / `Atualizar...`   | `CriarClienteDto`               |
| DTO saída             | `<Nome>ResponseDto`                 | `ClienteResponseDto`            |
| Repositório Prisma    | `Prisma<Nome>Repository`            | `PrismaClienteRepository`       |
| Controller            | `<Nome>Controller`                  | `ClienteController`             |
| Arquivo               | `kebab-case`                        | `criar-cliente.use-case.ts`     |

---

## Fluxo de uma Requisição HTTP

```
HTTP Request
    │
    ▼
[Controller]  ← valida body com ZodValidationPipe (schema Zod do DTO)
    │            extrai usuário autenticado (decorator)
    ▼
[Service]     ← fachada da camada de application
    │            ponto de entrada único; delega para o use-case correto
    ▼
[UseCase]     ← orquestra regras de negócio
    │            chama repository interface
    ▼
[Repository Interface] ← porta do domínio
    │
    ▼
[Prisma Repository] ← implementação concreta
    │
    ▼
[Banco de Dados]
    │
    ▼  (retorno sobe camadas)
[ResponseDto]  ← serializado no service ou no use-case
    │
    ▼
HTTP Response
```

---

## Próximos Passos para o Agente

1. Leia `references/layer-patterns.md` para ver **código completo** de cada camada.
2. Leia `references/modules/<modulo>.md` para ver a implementação do módulo específico solicitado.
3. Ao gerar código, siga **estritamente** as convenções acima.
4. Nunca coloque lógica de negócio em controllers ou repositories.
5. Sempre gere a interface do repositório antes da implementação Prisma.