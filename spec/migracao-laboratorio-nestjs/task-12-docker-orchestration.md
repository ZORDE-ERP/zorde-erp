# Task 12: Orquestração de Infraestrutura — Docker & Compose

## 📌 Objetivo
Esta tarefa consiste em configurar e orquestrar o ambiente de conteinerização do microsserviço `apps/api/zorde-erp-laboratorio` e do banco de dados relacional local, garantindo inicialização rápida, portabilidade e builds otimizados para produção:
1. Escrita de um `Dockerfile` multi-stage otimizado na pasta do microsserviço.
2. Criação/Atualização do arquivo global `docker-compose.yaml` no monorepo para subir o banco de dados PostgreSQL 16 com scripts de auto-healing (healthcheck) e o container da API de forma orquestrada.

---

## 🛠️ MCP (`context7`) — Como Obter Ajuda de Documentação
Se precisar de exemplos sobre otimizações de imagens Docker Alpine para aplicações Node/NestJS ou comandos de validação de disponibilidade de Postgres:
- Utilize a ferramenta de busca/MCP do `context7` para obter a documentação atual sobre **Docker** (multi-stage Node builds, slim Alpine images) e **Docker Compose** (healthcheck options).

---

## 📂 Diretórios & Arquivos Alvo
- `apps/api/zorde-erp-laboratorio/Dockerfile`
- `docker-compose.yaml` (na raiz do monorepo)

---

## 📋 Checklist de Execução

### 1. Escrita do `Dockerfile` de Produção (Multi-Stage)
- [ ] Crie o arquivo `apps/api/zorde-erp-laboratorio/Dockerfile`:
  - **Stage 1 (`deps`)**:
    - Base: `node:24-alpine`.
    - Definir `WORKDIR /app`.
    - Copiar `package.json` e `package-lock.json` (ou correspondentes).
    - Executar `npm ci --only=production` para obter os pacotes de produção limpos e copiar as `node_modules` geradas para um diretório temporário externo (ex: `/prod_modules`).
    - Executar `npm ci` para instalar todas as dependências (incluindo devDependencies necessárias para compilação).
  - **Stage 2 (`builder`)**:
    - Base: `node:24-alpine`.
    - Copiar as `node_modules` completas geradas no Stage 1.
    - Copiar todos os arquivos de código-fonte.
    - Executar `npx prisma generate` para gerar as definições do Prisma Client.
    - Executar `npm run build` para compilar o TypeScript em JavaScript nativo em `dist/`.
  - **Stage 3 (`runner`)**:
    - Base: `node:24-alpine`.
    - Configurar segurança criando um grupo e usuário sem privilégios de root para rodar a aplicação NestJS:
      `RUN addgroup --system --gid 1001 nestjs && adduser --system --uid 1001 nestjs`
    - Copiar as dependências puras do diretório `/prod_modules` obtido no Stage 1 para `node_modules/`.
    - Copiar o diretório compilado `dist/` do Stage 2.
    - Copiar os arquivos gerados do Prisma (`node_modules/.prisma` ou `node_modules/@prisma/client`) e a pasta `prisma/` contendo as migrations e schema.
    - Setar propriedade dos arquivos copiados para o usuário `nestjs`.
    - Alterar contexto para o usuário não-root: `USER nestjs`.
    - Expor a porta padrão: `EXPOSE 3000`.
    - Definir comando de inicialização padrão: `CMD ["node", "dist/main.js"]`.

### 2. Configuração do Orquestrador (`docker-compose.yaml`)
- [ ] Crie ou atualize o arquivo `docker-compose.yaml` na raiz do monorepo:
  - Declarar a versão compatível de compose.
  - **Serviço `postgres`**:
    - Imagem: `postgres:16-alpine`.
    - Nome do Container: `zorde_postgres`.
    - Variáveis de ambiente a partir do `.env`: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`.
    - Portas de saída: `"5432:5432"`.
    - Volumes nomeados para persistência: `postgres_data:/var/lib/postgresql/data`.
    - **Healthcheck Estrito**:
      - Teste: `["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]`.
      - Intervalo: `10s`.
      - Timeout: `5s`.
      - Retries: `5`.
  - **Serviço `api`**:
    - Caminho de build: `context: ./apps/api/zorde-erp-laboratorio`.
    - Arquivo de build: `Dockerfile`.
    - Nome do Container: `zorde_api`.
    - Restart: `unless-stopped`.
    - Portas de saída: `"3000:3000"` (ou mapeadas via variável `${API_PORT}`).
    - Dependência:
      - `postgres` com a condição obrigatória de `service_healthy` (impede a API de iniciar e falhar a conexão antes do Postgres estar pronto para receber requisições).
    - Variáveis de ambiente injetadas:
      - `PORT`: `${API_PORT}`
      - `DATABASE_URL`: `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?sslmode=disable`
      - `RESEND_API_KEY`
      - `JWT_SECRET`
      - `APP_ENV`
  - **Volumes Globais**:
    - Declarar volume persistente `postgres_data`.

---

## 🎯 Critérios de Aceitação
1. O comando `docker compose build` na raiz do monorepo deve construir a imagem da API com sucesso e tamanho reduzido (Alpine multi-stage).
2. O container da API não deve falhar nem sofrer crash na inicialização caso o banco de dados Postgres leve alguns segundos extras para iniciar (o healthcheck com `depends_on` deve segurar a inicialização).
3. As migrations do Prisma devem ser aplicáveis de dentro do container de forma limpa.
