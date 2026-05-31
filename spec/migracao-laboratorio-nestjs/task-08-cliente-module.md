# Task 08: Módulo Cliente — CRUD Completo com Soft Delete

## 📌 Objetivo
Esta tarefa consiste em implementar o módulo de **Cliente** (`apps/api/zorde-erp-laboratorio/src/modules/cliente`), responsável pelo cadastro e gerência de clientes (Pessoas Físicas e Pessoas Jurídicas). Este módulo introduz a lógica de **Soft Delete** (exclusão lógica via campo `deleted_at`), que deve ser suportada de forma transparente em todas as operações de leitura e escrita do repositório:
1. Modelagem da classe de domínio pura `ClienteEntity`.
2. Criação da interface `IClienteRepository` e seu token correspondente.
3. Criação de schemas Zod e DTOs de entrada e saída, validando as regras de `TipoPessoa` (`FISICA` | `JURIDICA`) e `StatusPessoa` (`ATIVO` | `INATIVO`).
4. Use cases de CRUD (`Criar`, `Buscar`, `Listar`, `Atualizar`, `Deletar` - Soft) acoplados ao ID do usuário autenticado (proprietário do registro).
5. Implementação do repositório Prisma com suporte a Soft Delete nas consultas.
6. Controllers protegidos pelo `JwtAuthGuard`.

---

## 🛠️ MCP (`context7`) — Como Obter Ajuda de Documentação
Se precisar de informações sobre como estruturar query filters dinâmicos para Soft Delete no Prisma ou validações complexas de CPF/CNPJ no Zod:
- Utilize a ferramenta de busca/MCP do `context7` para obter a documentação atual do **Prisma** (soft delete middlewares, query interceptors) e **Zod** (refine for document formats).

---

## 📂 Diretórios & Arquivos Alvo
- `apps/api/zorde-erp-laboratorio/src/modules/cliente/domain/entities/cliente.entity.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/cliente/domain/repositories/i-cliente.repository.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/cliente/application/dtos/`
  - `criar-cliente.dto.ts`
  - `atualizar-cliente.dto.ts`
  - `cliente-response.dto.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/cliente/application/use-cases/`
  - `criar-cliente.use-case.ts`
  - `buscar-cliente.use-case.ts`
  - `listar-clientes.use-case.ts`
  - `atualizar-cliente.use-case.ts`
  - `deletar-cliente.use-case.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/cliente/application/services/cliente.service.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/cliente/infrastructure/repositories/prisma-cliente.repository.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/cliente/presentation/controllers/cliente.controller.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/cliente/cliente.module.ts`

---

## 📋 Checklist de Execução

### 1. Entidade de Domínio e Interface do Repositório
- [ ] Crie `src/modules/cliente/domain/entities/cliente.entity.ts`:
  - Mapear a classe pura `ClienteEntity` contendo todas as propriedades mapeadas de `clientes` da spec: `id`, `nome`, `email`, `contato` (opcional), `tipoPessoa` (enum `TipoPessoa`), `documento`, `status` (enum `StatusPessoa`), `cep`, `uf`, `cidade`, `logradouro`, `numero`, `bairro`, `observacao`, `usuarioId`, `createdAt`, `updatedAt`, `deletedAt` (Date | null).
- [ ] Crie `src/modules/cliente/domain/repositories/i-cliente.repository.ts`:
  - Interface `IClienteRepository` contendo os contratos:
    - `criar(cliente: ClienteEntity): Promise<ClienteEntity>`
    - `buscarPorId(id: number): Promise<ClienteEntity | null>`
    - `listarPorUsuario(usuarioId: number): Promise<ClienteEntity[]>` (Filtrar somente não excluídos logics)
    - `atualizar(id: number, cliente: Partial<ClienteEntity>): Promise<ClienteEntity>`
    - `deletarSoft(id: number): Promise<void>`
  - Exportar o token DI: `export const I_CLIENTE_REPOSITORY = 'IClienteRepository';`

### 2. DTOs de Aplicação (Zod)
- [ ] Crie os DTOs com validação Zod:
  - `CriarClienteDto`: `nome`, `email`, `contato` (opcional), `tipoPessoa` (validação estrita contra enum `TipoPessoa`), `documento` (validação de formato de CPF/CNPJ), `status` (opcional, default `ATIVO`), endereço campos opcionais (`cep`, `uf`, `cidade`, `logradouro`, `numero`, `bairro`, `observacao`).
  - `AtualizarClienteDto`: Todos os campos anteriores opcionais.
  - `ClienteResponseDto`: Mapper que serializa a entidade para formato JSON de saída.

### 3. Use Cases do CRUD
- [ ] **`criar-cliente.use-case.ts`**:
  - Injetar `IClienteRepository`. Receber DTO de criação + `usuarioId` logado.
  - Validar lógica de formato de CPF/CNPJ de acordo com a propriedade `tipoPessoa`.
  - Persistir e retornar.
- [ ] **`buscar-cliente.use-case.ts`**:
  - Receber ID do cliente + `usuarioId` logado (para garantir que só busca clientes pertencentes ao tenant).
  - Obter cliente. Se não existir ou se estiver excluído logicamente (`deletedAt` diferente de null), disparar `EntityNotFoundException`. Retornar DTO.
- [ ] **`listar-clientes.use-case.ts`**:
  - Buscar todos os clientes ativos pertencentes ao `usuarioId` fornecido no token do usuário logado.
- [ ] **`atualizar-cliente.use-case.ts`**:
  - Buscar cliente existente por ID e assegurar propriedade/autorização.
  - Executar o update parcial, validando novos valores.
- [ ] **`deletar-cliente.use-case.ts`**:
  - Buscar cliente ativo. Se não encontrado, lançar 404.
  - Invocar `deletarSoft(id)` que atualizará o campo `deleted_at` com o timestamp do momento atual, mantendo a linha salva física na tabela.

### 4. Repositório Prisma (Lógica de Soft Delete)
- [ ] Crie `prisma-cliente.repository.ts`:
  - Implementar os métodos CRUD com `PrismaService`.
  - **Importante**: Em todos os métodos de leitura (`buscarPorId`, `listarPorUsuario`, `atualizar`), incluir a cláusula `where: { deleted_at: null }` para que os registros deletados de forma lógica sejam ignorados de forma transparente.
  - No método `deletarSoft(id)`, executar um update de linha `update({ where: { id }, data: { deleted_at: new Date() } })`.

### 5. Controller Autenticado
- [ ] Crie `src/modules/cliente/presentation/controllers/cliente.controller.ts`:
  - `@Controller('api/clientes')` decorado com `@UseGuards(JwtAuthGuard)`.
  - Injetar `ClienteService` facade.
  - Mapear os 5 métodos HTTP (POST, GET, GET /:id, PUT /:id, DELETE /:id).
  - Injetar o ID do usuário autenticado nos use cases a partir do decorator `@CurrentUser('id')` para garantir segurança e inquilinato (multi-tenancy).

### 6. Configuração do Módulo
- [ ] Configurar `src/modules/cliente/cliente.module.ts` declarando as injeções e exports correspondentes. Registrar o módulo no `AppModule` principal.

---

## 🎯 Critérios de Aceitação
1. Todas as rotas do controlador de clientes devem bloquear acesso anônimo disparando HTTP 401.
2. Clientes excluídos (que possuem `deleted_at` preenchido no banco) não podem retornar na rota de listagem ou busca individual, respondendo com HTTP 404 na busca direta.
3. A rota de exclusão DELETE `/api/clientes/:id` deve executar um update de timestamp na coluna `deleted_at`, nunca um comando `DELETE` físico direto de banco de dados.
