# Task 10: Módulo Tabela Montagem — CRUD com Paginação e Busca

## 📌 Objetivo
Esta tarefa consiste em implementar o módulo de **Tabela de Montagem** (`apps/api/zorde-erp-laboratorio/src/modules/tabelaMontagem`), que gerencia o catálogo de serviços de montagem e seus respectivos valores precificados para cada cliente. Este módulo possui filtros avançados de busca, paginação estrita de banco de dados e validações relacionais com o módulo de Clientes:
1. Mapeamento da classe de domínio pura `TabelaMontagemEntity`.
2. Criação da interface de repositório `ITabelaMontagemRepository` e seu token DI correspondente.
3. Criação de schemas Zod e DTOs de entrada e saída, validando o enum `TipoServico` e garantindo o retorno enriquecido com o nome do cliente (`nomeCliente`).
4. Use cases de CRUD (`Criar`, `ListarPaginado`, `Atualizar`, `Deletar` - Soft) com validação de existência do cliente no banco antes do cadastro de novas tabelas de preços.
5. Implementação do repositório Prisma com buscas relacionais textuais (`ILIKE` / `insensitive` lookup) por `servico` ou `cliente.nome`, paginação nativa (`skip` e `take`) e exclusão lógica.
6. Controllers protegidos.

---

## 🛠️ MCP (`context7`) — Como Obter Ajuda de Documentação
Se precisar de exemplos sobre como estruturar paginações estritas e buscas relacionais compostas (Nested relational filtering) com Prisma no NestJS:
- Utilize a ferramenta de busca/MCP do `context7` para obter a documentação atual do **Prisma** (nested writes, relational filters, pagination) e **Zod** (coercion for query params).

---

## 📂 Diretórios & Arquivos Alvo
- `apps/api/zorde-erp-laboratorio/src/modules/tabelaMontagem/domain/entities/tabela-montagem.entity.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/tabelaMontagem/domain/repositories/i-tabela-montagem.repository.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/tabelaMontagem/application/dtos/`
  - `criar-tabela-montagem.dto.ts`
  - `atualizar-tabela-montagem.dto.ts`
  - `tabela-montagem-response.dto.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/tabelaMontagem/application/use-cases/`
  - `criar-tabela-montagem.use-case.ts`
  - `listar-tabela-montagem.use-case.ts`
  - `atualizar-tabela-montagem.use-case.ts`
  - `deletar-tabela-montagem.use-case.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/tabelaMontagem/application/services/tabela-montagem.service.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/tabelaMontagem/infrastructure/repositories/prisma-tabela-montagem.repository.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/tabelaMontagem/presentation/controllers/tabela-montagem.controller.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/tabelaMontagem/tabela-montagem.module.ts`

---

## 📋 Checklist de Execução

### 1. Entidade de Domínio e Interface do Repositório
- [ ] Crie `src/modules/tabelaMontagem/domain/entities/tabela-montagem.entity.ts`:
  - Propriedades de `TabelaMontagemEntity`: `id`, `clienteId`, `servico` (enum `TipoServico`), `valor` (number), `createdAt`, `updatedAt`, `deletedAt` (Date | null).
- [ ] Crie `src/modules/tabelaMontagem/domain/repositories/i-tabela-montagem.repository.ts`:
  - Interface `ITabelaMontagemRepository` contendo os contratos:
    - `criar(tabela: TabelaMontagemEntity): Promise<TabelaMontagemEntity>`
    - `buscarPorId(id: number): Promise<TabelaMontagemEntity | null>`
    - `listarPaginado(params: { page: number; limit: number; search?: string }): Promise<{ items: TabelaMontagemEntity[]; total: number }>`
    - `atualizar(id: number, tabela: Partial<TabelaMontagemEntity>): Promise<TabelaMontagemEntity>`
    - `deletarSoft(id: number): Promise<void>`
  - Token DI: `export const I_TABELA_MONTAGEM_REPOSITORY = 'ITabelaMontagemRepository';`

### 2. DTOs de Validação (Zod)
- [ ] Crie os DTOs com validação Zod:
  - `CriarTabelaMontagemDto`: `clienteId` (inteiro positivo, obrigatório), `servico` (validação estrita contra o enum `TipoServico`), `valor` (float positivo, obrigatório).
  - `AtualizarTabelaMontagemDto`: Todos os campos anteriores opcionais.
  - `TabelaMontagemResponseDto`: Mapper que serializa a resposta, contendo o campo calculado `nomeCliente` (resolvido através da relação/join com Cliente).

### 3. Use Cases do Catálogo de Preços
- [ ] **`criar-tabela-montagem.use-case.ts`**:
  - Injetar `ITabelaMontagemRepository` e `IClienteRepository` (de ClienteModule).
  - Validar se o `clienteId` fornecido existe e está ativo no banco. Se não encontrado ou deletado, disparar `EntityNotFoundException` (Código 404).
  - Validar que o `servico` informado confere com os valores permitidos do enum `TipoServico`.
  - Persistir a tabela de montagem e retornar.
- [ ] **`listar-tabela-montagem.use-case.ts`**:
  - Receber os query params de paginação: `page` (default 1), `limit` (default 10) e `search` (default vazio '').
  - Invocar o repositório e formatar o retorno contendo a listagem de itens e o totalizador (`total`) para metadados de paginação HTTP.
- [ ] **`atualizar-tabela-montagem.use-case.ts`**:
  - Buscar item de precificação por ID. Se não encontrado, lançar erro 404.
  - Se `clienteId` for alterado, validar nova existência e status.
  - Realizar o update parcial e retornar.
- [ ] **`deletar-tabela-montagem.use-case.ts`**:
  - Validar existência ativa do registro e executar exclusão lógica (`deletedAt = new Date()`).

### 4. Repositório Prisma (Join Relacional & Filtro de Texto)
- [ ] Crie `prisma-tabela-montagem.repository.ts`:
  - Implementar os métodos CRUD usando `PrismaService`.
  - No método `listarPaginado(params)`:
    - Calcular `skip = (page - 1) * limit` e `take = limit`.
    - No query filter `where`:
      - Garantir `deleted_at: null`.
      - Se a string `search` for preenchida: aplicar busca condicional em `OR` contendo:
        1. `servico` com filtro `contains` case-insensitive.
        2. `cliente` relacionando a propriedade `nome` com filtro `contains` case-insensitive.
    - Executar `findMany` com `skip`, `take`, `where` e `include: { cliente: true }` para carregar o relacionamento de cliente.
    - Executar em paralelo `count({ where })` para obter o total de registros para a paginação.
    - Retornar o par `{ items, total }`.

### 5. Controller Autenticado
- [ ] Crie `src/modules/tabelaMontagem/presentation/controllers/tabela-montagem.controller.ts`:
  - `@Controller('api/tabela-montagem')` decorado com `@UseGuards(JwtAuthGuard)`.
  - Endpoint **`GET /`**:
    - Receber via Query: `page`, `limit` e `search`. Coergir strings de query params para números usando Zod.
    - Retornar listagem paginada enriquecida.
  - Endpoints **`POST /`**, **`PUT /:id`**, **`DELETE /:id`** direcionando para seus use cases correspondentes.

### 6. Configuração do Módulo
- [ ] Configurar `src/modules/tabelaMontagem/tabela-montagem.module.ts`, garantindo o import de `ClienteModule` (para acesso ao repositório de clientes na validação) e `DatabaseModule`. Registrar no `AppModule` principal.

---

## 🎯 Critérios de Aceitação
1. Rota de listagem `GET /api/tabela-montagem` deve suportar busca por parte do nome do cliente ou tipo do serviço em formato case-insensitive (`ILIKE`).
2. Tentar cadastrar um serviço para um `clienteId` inexistente no banco deve lançar um erro respondendo com status HTTP 404.
3. A exclusão de um registro deve realizar o soft delete e ocultar o registro de buscas e listagens.
