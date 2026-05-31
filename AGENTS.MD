# AGENT.md — Guia do Agente de Desenvolvimento

Você é um assistente de desenvolvimento especialista neste projeto.  
Este arquivo é seu ponto de entrada. **Nunca carregue todos os documentos de uma vez.**  
Leia apenas o(s) arquivo(s) indicado(s) para a tarefa solicitada.

---

## Regra Principal

> Antes de escrever qualquer código, modificar qualquer arquivo ou tomar qualquer decisão arquitetural,
> **identifique a categoria da tarefa** na tabela abaixo e leia os documentos correspondentes.
> Só então execute.

---

## Mapa de Documentos por Demanda

### Arquitetura & Código

| Quando o usuário pedir... | Leia antes de agir |
|---|---|
| Criar módulo, domínio, entidade, use case, repositório, DTO, controller, mapper ou qualquer artefato de código | `docs/ARCHITECTURE.md` |
| Estrutura de pastas, onde colocar um arquivo, convenções de nome | `docs/ARCHITECTURE.md` |
| Injeção de dependência, tokens, providers, módulo NestJS | `docs/ARCHITECTURE.md` |
| Value Objects, regras de domínio, comportamentos de entidade | `docs/ARCHITECTURE.md` |

### Banco de Dados & Migrations

| Quando o usuário pedir... | Leia antes de agir |
|---|---|
| Criar, rodar, reverter ou revisar migrations | `docs/MIGRATIONS.md` |
| Alterar schema, adicionar coluna, criar tabela, índice, FK | `docs/MIGRATIONS.md` |
| Seed de dados, fixtures, dados iniciais | `docs/MIGRATIONS.md` |
| Problemas com TypeORM schema, sincronização | `docs/MIGRATIONS.md` |

### Testes

| Quando o usuário pedir... | Leia antes de agir |
|---|---|
| Escrever ou corrigir testes unitários (use cases, domínio) | `docs/TESTING.md` |
| Escrever testes de integração ou e2e | `docs/TESTING.md` |
| Configurar Jest, mocks, factories de teste | `docs/TESTING.md` |
| Cobertura de testes, o que deve ser testado | `docs/TESTING.md` |

### Autenticação & Segurança

| Quando o usuário pedir... | Leia antes de agir |
|---|---|
| Qualquer coisa sobre JWT, login, refresh token, guards | `docs/AUTH.md` |
| Permissões, roles, decorators de autorização | `docs/AUTH.md` |
| Proteção de rotas, estratégias Passport | `docs/AUTH.md` |

### API & Contratos

| Quando o usuário pedir... | Leia antes de agir |
|---|---|
| Padrão de resposta da API, envelope de dados | `docs/API-STANDARDS.md` |
| Versionamento de endpoints, prefixos de rota | `docs/API-STANDARDS.md` |
| Paginação, filtros, ordenação em endpoints | `docs/API-STANDARDS.md` |
| Swagger/OpenAPI, documentação de endpoints | `docs/API-STANDARDS.md` |
| Tratamento de erros HTTP, códigos de status | `docs/API-STANDARDS.md` |

### Infraestrutura & Deploy

| Quando o usuário pedir... | Leia antes de agir |
|---|---|
| Docker, docker-compose, variáveis de ambiente | `docs/INFRA.md` |
| CI/CD, pipelines, deploy | `docs/INFRA.md` |
| Configuração de ambiente (dev, staging, prod) | `docs/INFRA.md` |

### Logging & Observabilidade

| Quando o usuário pedir... | Leia antes de agir |
|---|---|
| Logs, rastreamento de erros, auditoria | `docs/LOGGING.md` |
| Health checks, métricas | `docs/LOGGING.md` |

---

## Fluxo de Decisão

```
Recebi uma tarefa
       │
       ▼
Identifiquei a categoria?
       │
   SIM │                          NÃO
       │                           │
       ▼                           ▼
Leia o(s) doc(s)         Pergunte ao usuário
indicado(s) acima        qual contexto se aplica
       │
       ▼
Siga EXATAMENTE o padrão descrito no doc
       │
       ▼
Só então escreva o código / execute a ação
```

---

## Regras de Comportamento

1. **Nunca assuma** — se a tarefa não se encaixar claramente em uma categoria, leia `docs/ARCHITECTURE.md` como ponto de partida e pergunte se precisar de mais contexto.

2. **Nunca crie arquivos em locais não documentados** — a estrutura de pastas está em `docs/ARCHITECTURE.md` e deve ser seguida sem exceção.

3. **Nunca misture camadas** — domain não importa NestJS, infrastructure não é importada pela presentation diretamente, etc. As regras estão em `docs/ARCHITECTURE.md`.

4. **Sempre valide migrações antes de rodar** — leia `docs/MIGRATIONS.md` antes de qualquer `migration:run`.

5. **Testes seguem o padrão do projeto** — não invente mocks ou estruturas de teste arbitrárias; leia `docs/TESTING.md`.

6. **Se um documento referenciado não existir ainda**, informe o usuário que o arquivo `docs/NOME.md` ainda não foi criado e pergunte se deseja criá-lo antes de prosseguir.

---

## Documentos Disponíveis

```
docs/
├── ARCHITECTURE.md       ✅ Estrutura modular, Clean Architecture, exemplos de código
├── MIGRATIONS.md         📋 (crie quando necessário)
├── TESTING.md            📋 (crie quando necessário)
├── AUTH.md               📋 (crie quando necessário)
├── API-STANDARDS.md      📋 (crie quando necessário)
├── INFRA.md              📋 (crie quando necessário)
└── LOGGING.md            📋 (crie quando necessário)
```

✅ = disponível | 📋 = ainda não criado

---

## Exemplo de Comportamento Esperado

**Usuário:** "Cria um use case para listar pedidos paginados"

**Agente:**
1. Identifica categoria → Arquitetura & Código
2. Lê `docs/ARCHITECTURE.md`
3. Segue a estrutura: `modules/pedido/application/use-cases/listar-pedidos/`
4. Gera entidade, interface de repositório, DTO paginado e use case conforme o padrão documentado

**Usuário:** "Preciso criar a migration para a tabela de pedidos"

**Agente:**
1. Identifica categoria → Banco de Dados & Migrations
2. Lê `docs/MIGRATIONS.md`
3. Segue o padrão de nomenclatura e comandos definidos ali
4. Só então gera ou executa a migration