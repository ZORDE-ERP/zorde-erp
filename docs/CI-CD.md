# CI/CD — API NestJS (`zorde-erp-laboratorio`)

Documentação do pipeline de **Integração Contínua (CI)** implementado para a API NestJS do monorepo Zorde. Este guia explica **o que** foi configurado, **por que** cada decisão foi tomada e **qual o impacto** no dia a dia do desenvolvimento.

> **Escopo atual:** apenas CI (verificação automática de qualidade). CD (deploy automático) ainda não está implementado.

---

## Índice

1. [Glossário](#1-glossário)
2. [Visão geral da arquitetura](#2-visão-geral-da-arquitetura)
3. [Arquivos envolvidos](#3-arquivos-envolvidos)
4. [Como a pipeline dispara](#4-como-a-pipeline-dispara)
5. [O job de CI — passo a passo](#5-o-job-de-ci--passo-a-passo)
6. [Configuração do Turborepo](#6-configuração-do-turborepo)
7. [Scripts da API](#7-scripts-da-api)
8. [Variáveis de ambiente no CI](#8-variáveis-de-ambiente-no-ci)
9. [Estratégia de cache e economia de minutos](#9-estratégia-de-cache-e-economia-de-minutos)
10. [O que cada verificação garante](#10-o-que-cada-verificação-garante)
11. [Como rodar localmente (mesmo que o CI)](#11-como-rodar-localmente-mesmo-que-o-ci)
12. [Evoluções futuras](#12-evoluções-futuras)
13. [Referências oficiais](#13-referências-oficiais)

---

## 1. Glossário

| Termo | Definição |
|---|---|
| **CI (Continuous Integration)** | Prática de integrar código com frequência e validar automaticamente a cada alteração. Responde: *"esse código pode entrar na branch principal?"* |
| **CD (Continuous Delivery/Deployment)** | Etapa seguinte à CI: após passar nas verificações, o código é entregue ou publicado automaticamente em um ambiente (staging, produção). |
| **Workflow** | Arquivo YAML em `.github/workflows/` que descreve **quando** e **como** a automação roda. No nosso caso: `.github/workflows/ci-api.yml`. |
| **Job** | Unidade de trabalho dentro de um workflow. Cada job roda em uma **máquina virtual isolada** (runner). Temos 1 job: `ci`. |
| **Step** | Passo individual dentro de um job (ex.: checkout, instalar dependências, rodar testes). Steps rodam **em sequência** dentro do mesmo job. |
| **Runner** | Máquina que executa o workflow. Usamos `ubuntu-latest` — uma VM Linux limpa provisionada pelo GitHub a cada execução. |
| **Action** | Bloco reutilizável do marketplace do GitHub (ex.: `actions/checkout@v4`, `actions/cache@v4`). Evita reescrever lógica comum. |
| **Trigger / Evento** | Evento Git que dispara o workflow (`push`, `pull_request`). |
| **Path filter** | Filtro que limita a execução do workflow a mudanças em caminhos específicos do repositório. |
| **Monorepo** | Repositório com múltiplos projetos (API NestJS, frontend Angular, API Go, packages compartilhados). |
| **Turborepo (Turbo)** | Orquestrador de tarefas do monorepo. Executa scripts (`lint`, `build`, `test`) com cache inteligente baseado em hash de inputs. |
| **Cache hit** | Quando o Turbo (ou GitHub Actions) encontra um resultado anterior idêntico e **pula a execução**, restaurando o output salvo. |
| **Cache miss** | Quando não há cache válido — a tarefa roda do zero e o resultado é salvo para runs futuras. |
| **`npm ci`** | Instala dependências de forma **determinística** a partir do `package-lock.json`. Mais rigoroso que `npm install` — ideal para CI. |
| **`--filter`** | Flag do Turbo que limita execução a um package específico do monorepo (`zorde-erp`). |
| **Lint** | Análise estática de código (estilo, padrões, erros comuns) sem executar o programa. Usamos **Biome**. |
| **Typecheck** | Verificação de tipos do TypeScript (`tsc --noEmit`) sem gerar arquivos JavaScript. |
| **Coverage (cobertura)** | Métrica de quantas linhas do código são exercitadas pelos testes. |
| **Prisma Client** | Código gerado a partir do schema do banco. Não fica no Git — precisa ser gerado antes de build/test. |
| **Secret** | Variável sensível armazenada no GitHub (Settings → Secrets). Nunca commitada no repositório. |
| **Minutos do GitHub Actions** | Tempo de execução dos runners. Contas gratuitas têm **2.000 min/mês** para repositórios privados. |

---

## 2. Visão geral da arquitetura

```mermaid
flowchart TD
    dev([Desenvolvedor faz push ou abre PR]) --> trigger{Mudou arquivo\nda API ou deps?}

    trigger -->|Não| skip([Workflow não dispara])
    trigger -->|Sim| runner[Runner ubuntu-latest]

    runner --> checkout[actions/checkout]
    checkout --> node[actions/setup-node\nNode 22 + cache npm]
    node --> npmci[npm ci]
    npmci --> turboCache[actions/cache\nrestaura .turbo/]
    turboCache --> prisma[npx prisma generate]
    prisma --> turbo[turbo run\nlint:check check-types test:cov build]

    turbo --> lint[lint:check\nBiome]
    turbo --> types[check-types\ntsc --noEmit]
    turbo --> tests[test:cov\nJest]
    turbo --> build[build\nnest build]

  lint --> result{Tudo passou?}
  types --> result
  tests --> result
  build --> result

    result -->|Sim| green([CI verde — merge liberado])
    result -->|Não| red([CI vermelho — corrigir antes do merge])
```

### Por que essa arquitetura?

| Decisão | Motivo | Impacto |
|---|---|---|
| **1 job em vez de 4 jobs paralelos** | Cada job GitHub Actions sobe uma VM nova (~1 min de overhead) e roda `npm ci` separado | Reduz de ~16 min para ~5-7 min por execução com mudanças reais |
| **Turbo orquestra as tarefas** | Paralelismo interno sem custo de múltiplas VMs | Lint, typecheck, test e build rodam na mesma máquina com cache compartilhado |
| **Path filter** | Monorepo tem Angular, Go e API — não faz sentido rodar CI da API quando só o frontend mudou | Economiza minutos e evita falsos positivos |
| **Cache em duas camadas** | npm (dependências) + Turbo (resultados de tarefas) | Runs subsequentes ficam significativamente mais rápidos |

---

## 3. Arquivos envolvidos

| Arquivo | Papel |
|---|---|
| [`.github/workflows/ci-api.yml`](../.github/workflows/ci-api.yml) | Define o workflow GitHub Actions |
| [`turbo.json`](../turbo.json) | Configura tarefas, inputs, outputs e comportamento de cache do Turbo |
| [`apps/api/zorde-erp-laboratorio/package.json`](../apps/api/zorde-erp-laboratorio/package.json) | Scripts executados pelo Turbo (`lint:check`, `check-types`, `test:cov`, `build`) |
| [`apps/api/zorde-erp-laboratorio/biome.json`](../apps/api/zorde-erp-laboratorio/biome.json) | Regras de lint específicas da API (estende o Biome da raiz) |
| [`apps/api/zorde-erp-laboratorio/prisma.config.ts`](../apps/api/zorde-erp-laboratorio/prisma.config.ts) | Aponta o schema Prisma usado no `prisma generate` |

---

## 4. Como a pipeline dispara

```yaml
on:
  push:
    branches: [master, develop]
    paths:
      - 'apps/api/zorde-erp-laboratorio/**'
      - 'packages/**'
      - 'turbo.json'
      - '.github/workflows/ci-api.yml'
  pull_request:
    branches: [master, develop]
    paths: (mesmos acima)
```

### Por que `push` **e** `pull_request`?

- **`push`**: valida commits enviados diretamente para `master` ou `develop`.
- **`pull_request`**: valida alterações **antes** do merge — é o principal gate de qualidade do time.

> Segundo a [documentação oficial do GitHub Actions](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows), quando `branches` e `paths` são usados juntos, o workflow só executa quando **ambas** as condições são satisfeitas.

### Por que filtrar por `paths`?

Sem o filtro, qualquer commit no monorepo (ex.: atualização do Angular) dispararia a CI da API NestJS. Com o filtro:

- Mudança só no frontend → **pipeline não roda** → 0 minutos gastos
- Mudança na API → **pipeline roda** → minutos gastos apenas quando necessário
- Mudança em `packages/**` → roda, pois packages compartilhados podem afetar a API
- Mudança no próprio workflow ou `turbo.json` → roda, para validar a configuração

### Por que `master` e `develop`?

São as branches de integração do projeto. A CI protege o código que entra nessas branches — ponto de partida para ambientes de staging/produção futuros.

---

## 5. O job de CI — passo a passo

Arquivo: `.github/workflows/ci-api.yml`

### Step 1 — Checkout

```yaml
- uses: actions/checkout@v4
```

| Aspecto | Detalhe |
|---|---|
| **O que faz** | Clona o repositório na VM em `$GITHUB_WORKSPACE` |
| **Por que** | O runner começa vazio — sem este step, não há código para verificar |
| **Impacto** | ~5-10 segundos. Obrigatório em todo workflow |

### Step 2 — Setup Node.js

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'npm'
```

| Aspecto | Detalhe |
|---|---|
| **O que faz** | Instala Node.js 22 e habilita cache do npm |
| **Por que Node 22** | Alinhado com o Dockerfile da API (`node:24-alpine` em produção; Node 22 é LTS estável e compatível) |
| **Por que `cache: 'npm'`** | A [documentação do GitHub](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs) recomenda cache nativo via `setup-node` — restaura `~/.npm` entre runs |
| **Impacto** | `npm ci` passa de ~90s para ~20-30s em cache hit |

### Step 3 — Instalar dependências

```yaml
- run: npm ci
```

| Aspecto | Detalhe |
|---|---|
| **O que faz** | Instala dependências exatamente como definidas no `package-lock.json` |
| **Por que `npm ci` e não `npm install`** | `npm ci` deleta `node_modules` e reinstala do zero — **determinístico e reproduzível**. A [documentação oficial](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs) recomenda `npm ci` para CI |
| **Impacto** | Garante que o que roda no CI é idêntico ao que qualquer dev tem localmente com o mesmo lockfile |

### Step 4 — Restaurar cache do Turbo

```yaml
- uses: actions/cache@v4
  with:
    path: .turbo
    key: ${{ runner.os }}-turbo-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-turbo-
```

| Aspecto | Detalhe |
|---|---|
| **O que faz** | Salva/restaura a pasta `.turbo/` entre execuções do workflow |
| **Por que** | O Turbo armazena hashes e outputs de tarefas. Sem persistir `.turbo/`, cada run começa do zero |
| **`key` com `github.sha`** | Identificador único por commit. Cada commit pode ter seu próprio cache |
| **`restore-keys` com prefixo** | Se não houver cache exato para o commit, usa o cache mais recente como base parcial — padrão recomendado pela [action `actions/cache`](https://github.com/actions/cache) |
| **Impacto** | Em mudanças que não afetam código (ex.: README), tarefas podem ser **puladas inteiramente** |

### Step 5 — Gerar Prisma Client

```yaml
- run: npx prisma generate
  working-directory: apps/api/zorde-erp-laboratorio
```

| Aspecto | Detalhe |
|---|---|
| **O que faz** | Gera o client TypeScript a partir de `prisma/zordeLabs.prisma` |
| **Por que** | O Prisma Client é código gerado — não está no Git. Sem ele, imports de `@prisma/client` falham em build, typecheck e testes |
| **Por que antes do Turbo** | Todas as tarefas subsequentes dependem do client existir |
| **Impacto** | ~2-5 segundos. Necessário em toda VM limpa |

### Step 6 — Verificações via Turbo

```yaml
- run: >
    npx turbo run lint:check check-types test:cov build
    --filter=zorde-erp
    --cache-dir=.turbo
```

| Aspecto | Detalhe |
|---|---|
| **O que faz** | Executa as 4 verificações de qualidade na API |
| **Por que via Turbo** | Orquestra tarefas com cache inteligente; no monorepo, é o padrão recomendado pela [documentação do Turborepo para CI](https://turbo.build/repo/docs/crafting-your-repository/constructing-ci) |
| **`--filter=zorde-erp`** | Limita ao package da API (`"name": "zorde-erp"`). Não executa lint/test do Angular ou Go |
| **`--cache-dir=.turbo`** | Garante que o cache salvo pelo `actions/cache` no step anterior é o mesmo usado pelo Turbo |
| **Impacto** | Coração da pipeline — define se o PR pode ser mergeado |

---

## 6. Configuração do Turborepo

Arquivo: `turbo.json`

### Tarefa `build`

```json
"build": {
  "dependsOn": ["^build"],
  "inputs": ["$TURBO_DEFAULT$", ".env*"],
  "outputs": ["dist/**"]
}
```

| Campo | Por que | Impacto |
|---|---|---|
| `dependsOn: ["^build"]` | Garante que dependências internas do monorepo sejam buildadas antes | Hoje a API não depende de packages com build, mas prepara o monorepo para o futuro |
| `outputs: ["dist/**"]` | O NestJS gera `dist/` — era `.next/**` (template Next.js) | **Correção crítica**: sem output correto, o Turbo não cacheia o build |
| `inputs: [".env*"]` | Mudanças em `.env` invalidam o cache de build | Evita usar build cacheado com configuração desatualizada |

### Tarefa `lint:check`

```json
"lint:check": {
  "dependsOn": ["^lint:check"]
}
```

Roda o Biome em modo verificação (`biome check .` sem `--write`). Falha se houver problemas de formatação ou regras violadas.

### Tarefa `check-types`

```json
"check-types": {
  "dependsOn": ["^check-types"],
  "inputs": ["src/**", "tsconfig*.json"],
  "outputs": []
}
```

| Aspecto | Detalhe |
|---|---|
| **Por que existe** | O Biome verifica sintaxe e padrões, mas **não verifica tipos** TypeScript |
| **`outputs: []`** | Typecheck não gera arquivos — só valida. Nada para cachear como artefato |
| **Impacto** | Detecta erros como passar `string` onde espera `number`, imports incorretos, etc. |

### Tarefa `test:cov`

```json
"test:cov": {
  "inputs": ["src/**", "test/**", "tsconfig*.json", "prisma/**"],
  "outputs": ["coverage/**"]
}
```

| Aspecto | Detalhe |
|---|---|
| **Por que `test:cov` e não `test`** | Gera relatório de cobertura no log do CI — visibilidade da qualidade dos testes |
| **`inputs` inclui `prisma/**`** | Mudanças no schema invalidam cache de testes que usam Prisma |
| **`outputs: ["coverage/**"]`** | Salva relatório de cobertura no cache do Turbo |
| **Impacto** | Se testes quebrarem, o merge é bloqueado |

---

## 7. Scripts da API

Arquivo: `apps/api/zorde-erp-laboratorio/package.json`

| Script | Comando | Executado no CI? |
|---|---|---|
| `lint:check` | `biome check .` | Sim |
| `check-types` | `tsc -p tsconfig.build.json --noEmit` | Sim |
| `test:cov` | `jest --coverage` | Sim |
| `build` | `nest build` | Sim |
| `lint` | `biome check . --write` | Não (corrige automaticamente — uso local) |
| `test:e2e` | `jest --config ./test/jest-e2e.json` | Não (futuro — precisa de banco real) |

### Por que `tsconfig.build.json` no check-types?

O `tsconfig.build.json` **exclui** arquivos de teste (`**/*.spec.ts`, `test/**`). No CI, queremos validar o código de **produção** — não os testes em si.

---

## 8. Variáveis de ambiente no CI

```yaml
env:
  DATABASE_URL: postgresql://fake:fake@localhost:5432/ci_db
  JWT_SECRET: ci-test-secret-not-real
  APP_ENV: test
  JWT_SECRET_EXPIRES_IN: 1h
  REFRESH_TOKEN_EXPIRES_IN: 7d
  RESEND_API_KEY: re_fake_key
  SALT_ROUNDS_BCRYPT: 1
  SERVER_URL: http://localhost:3000
  API_PORT: 3000
  POSTGRES_DB: ci_db
  POSTGRES_USER: fake
  POSTGRES_PASSWORD: fake
```

### Por que existem se os testes usam mocks?

A API valida variáveis de ambiente via `validateEnv()` em `src/config/env.validation.ts` usando Zod. Mesmo com mocks nos repositórios, alguns testes chamam `validateEnv()` no `beforeAll` — sem variáveis válidas, os testes falham antes de rodar.

### Por que valores falsos e não secrets reais?

| Motivo | Explicação |
|---|---|
| **Segurança** | Secrets reais no YAML seriam expostos no log do CI |
| **Desnecessário** | Testes unitários usam mocks — não conectam a banco, email ou serviços reais |
| **`SALT_ROUNDS_BCRYPT: 1`** | Bcrypt/Argon2 são intencionalmente lentos. Valor baixo acelera os testes sem afetar o que está sendo testado (lógica de negócio, não performance de hash) |

### Quando usar GitHub Secrets?

Quando precisar de valores reais — por exemplo, testes E2E com banco PostgreSQL real:

```yaml
env:
  DATABASE_URL: ${{ secrets.CI_DATABASE_URL }}
```

Secrets ficam em: **GitHub → Settings → Secrets and variables → Actions**.

---

## 9. Estratégia de cache e economia de minutos

### Camada 1 — Cache do npm (`setup-node`)

- **O que cacheia:** pasta `~/.npm` (pacotes baixados)
- **Quando invalida:** mudança no `package-lock.json`
- **Economia:** ~60-70% do tempo de `npm ci`

### Camada 2 — Cache do Turbo (`actions/cache` + `.turbo/`)

- **O que cacheia:** resultados de tarefas (lint, typecheck, test, build)
- **Como funciona:** Turbo calcula hash dos `inputs` de cada tarefa. Se o hash é igual a uma execução anterior, a tarefa é **skipped**
- **Quando invalida:** mudança em qualquer arquivo listado em `inputs` da tarefa
- **Economia:** tarefas inteiras puladas em commits que não alteram código relevante

### Camada 3 — Path filter (trigger)

- **O que economiza:** execuções inteiras do workflow
- **Quando:** mudanças fora dos paths configurados

### Estimativa de consumo mensal

| Cenário | Tempo estimado | Execuções possíveis (2.000 min/mês) |
|---|---|---|
| Push com mudanças reais na API | ~5-7 min | ~285-400 execuções |
| Push só em docs/README da API | ~2 min (cache hit) | ~1.000 execuções |
| Push só no frontend | 0 min (não dispara) | ilimitado |
| Abordagem ingênua (4 jobs sem cache) | ~16 min | ~125 execuções |

### Remote Cache (evolução futura)

O Turborepo suporta **Remote Cache** da Vercel — compartilha cache entre CI e máquinas locais dos devs. Configuração:

```yaml
env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}
```

Com isso, se um dev rodar `turbo run build` localmente e fizer push, o CI pode reutilizar o resultado sem rebuildar.

---

## 10. O que cada verificação garante

```mermaid
flowchart LR
    code([Código alterado]) --> lint[lint:check]
    code --> types[check-types]
    code --> tests[test:cov]
    code --> build[build]

    lint -->|Biome| q1["Estilo, imports não usados,\npromises sem await, no any"]
    types -->|tsc| q2["Tipos corretos,\nsem erros de compilação"]
    tests -->|Jest| q3["Lógica de negócio funciona,\ncobertura registrada"]
    build -->|nest build| q4["Compila para produção,\nsem erros de bundling"]
```

| Verificação | Ferramenta | O que detecta | O que NÃO detecta |
|---|---|---|---|
| `lint:check` | Biome | Imports não usados, `any` explícito, promises flutuantes, formatação | Erros de tipo TypeScript |
| `check-types` | TypeScript (`tsc`) | Tipos incompatíveis, propriedades inexistentes, generics incorretos | Bugs de lógica de negócio |
| `test:cov` | Jest | Regressões em use-cases, services, controllers testados | Integração real com banco, Redis, RabbitMQ |
| `build` | NestJS CLI | Erros de compilação, imports quebrados, decorators inválidos | Runtime errors em produção |

### Por que as quatro juntas?

Cada ferramenta cobre uma camada diferente. Lint sozinho não pega erro de tipo. Typecheck sozinho não pega bug de lógica. Testes sozinhos não garantem que o projeto compila para produção. Juntas, formam uma rede de segurança.

---

## 11. Como rodar localmente (mesmo que o CI)

```bash
# Na raiz do monorepo
export DATABASE_URL='postgresql://fake:fake@localhost:5432/ci_db'
export JWT_SECRET='ci-test-secret-not-real'
export APP_ENV='test'
export JWT_SECRET_EXPIRES_IN='1h'
export REFRESH_TOKEN_EXPIRES_IN='7d'
export RESEND_API_KEY='re_fake_key'
export SALT_ROUNDS_BCRYPT='1'
export SERVER_URL='http://localhost:3000'
export API_PORT='3000'
export POSTGRES_DB='ci_db'
export POSTGRES_USER='fake'
export POSTGRES_PASSWORD='fake'

# Gerar Prisma Client
cd apps/api/zorde-erp-laboratorio && npx prisma generate && cd -

# Rodar as mesmas verificações do CI
npx turbo run lint:check check-types test:cov build --filter=zorde-erp
```

### Rodar verificações individuais

```bash
# Só lint
npx turbo run lint:check --filter=zorde-erp

# Só typecheck
npx turbo run check-types --filter=zorde-erp

# Só testes
npx turbo run test:cov --filter=zorde-erp

# Só build
npx turbo run build --filter=zorde-erp
```

### Ver o que o Turbo cachearia (dry run)

```bash
npx turbo run lint:check check-types test:cov build --filter=zorde-erp --dry-run
```

---

## 12. Evoluções futuras

### Testes E2E com banco real

Hoje os testes E2E (`*E2E.spec.ts`) rodam como placeholders ou com mocks. Para testes de integração real:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_DB: ci_db
      POSTGRES_USER: fake
      POSTGRES_PASSWORD: fake
    ports:
      - 5432:5432
```

Seguido de `prisma migrate deploy` e `npm run test:e2e`. A tarefa `test:e2e` no `turbo.json` deve ter `"cache": false` pois depende de estado externo.

> Referência: [GitHub Actions — PostgreSQL service containers](https://docs.github.com/en/actions/tutorials/use-containerized-services/create-postgresql-service-containers)

### Redis e RabbitMQ

Quando adicionados ao projeto, basta incluir mais entradas em `services:` no workflow. O GitHub Actions suporta múltiplos containers por job.

### Pipeline do frontend Angular

Novo arquivo `.github/workflows/ci-frontend.yml` com paths filtrados para `apps/app/zorde-labs/**` e `--filter=zorde-labs-app` (Node >= 24).

### CD (deploy automático)

Segundo workflow disparado apenas no push para `master`:

1. Build da imagem Docker
2. Push para registry (GHCR, Docker Hub)
3. Deploy em ambiente de staging/produção

### Branch protection rules

No GitHub, configurar `master` e `develop` para exigir que a CI passe antes do merge:

**Settings → Branches → Branch protection rules → Require status checks to pass**

---

## 13. Referências oficiais

| Tópico | Fonte |
|---|---|
| Eventos e triggers (`push`, `pull_request`, `paths`) | [GitHub Actions — Events that trigger workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows) |
| Cache de dependências (`actions/cache`) | [actions/cache — README e exemplos](https://github.com/actions/cache) |
| Node.js no CI (`setup-node`, `npm ci`, cache npm) | [GitHub Actions — Building and testing Node.js](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs) |
| Service containers (PostgreSQL) | [GitHub Actions — PostgreSQL service containers](https://docs.github.com/en/actions/tutorials/use-containerized-services/create-postgresql-service-containers) |
| Turborepo no CI | [Turborepo — Constructing CI](https://turbo.build/repo/docs/crafting-your-repository/constructing-ci) |
| Configuração de tarefas (`turbo.json`) | [Turborepo — Configuring tasks](https://turbo.build/repo/docs/reference/configuration) |
| Remote Cache do Turbo | [Turborepo — Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) |
| GitHub Actions — minutos e billing | [GitHub Actions — Billing](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions) |

---

## Resumo executivo

A pipeline implementada é um **gate de qualidade automatizado** para a API NestJS. Ela:

1. **Dispara** apenas quando código relevante muda, em `master` e `develop`
2. **Instala** dependências de forma determinística (`npm ci`)
3. **Cacheia** dependências (npm) e resultados de tarefas (Turbo) para economizar minutos
4. **Verifica** estilo (Biome), tipos (TypeScript), testes (Jest) e compilação (NestJS build)
5. **Bloqueia** merges com problemas — quando branch protection estiver configurada

O investimento em cache e job único com Turbo transforma ~16 min por execução (abordagem ingênua) em ~5-7 min (com mudanças) ou ~2 min (cache hit), estendendo significativamente o limite mensal de 2.000 minutos do GitHub Actions.
