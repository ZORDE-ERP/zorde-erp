# Task 09: Módulo Fornecedor — CRUD Completo com Soft Delete

## 📌 Objetivo
Esta tarefa consiste em implementar o módulo de **Fornecedor** (`apps/api/zorde-erp-laboratorio/src/modules/fornecedor`), responsável pelo cadastro e gerência dos fornecedores que abastecem o sistema. O módulo segue exatamente o mesmo padrão arquitetural e regras de exclusão lógica (Soft Delete) do módulo de Cliente, garantindo consistência no ecossistema de dados:
1. Modelagem da classe de domínio pura `FornecedorEntity`.
2. Criação da interface `IFornecedorRepository` e seu token DI correspondente.
3. Criação de schemas Zod e DTOs de entrada e saída, validando as regras de `TipoPessoa` e `StatusPessoa`.
4. Use cases de CRUD (`Criar`, `Buscar`, `Listar`, `Atualizar`, `Deletar` - Soft) acoplados ao ID do usuário autenticado (proprietário do registro).
5. Implementação do repositório Prisma com suporte a Soft Delete nas consultas.
6. Controllers protegidos pelo `JwtAuthGuard`.

---

## 🛠️ MCP (`context7`) — Como Obter Ajuda de Documentação
Se precisar de suporte com query filters compostos com condicionais opcionais no Prisma ou validações personalizadas de CPF/CNPJ para fornecedores:
- Utilize a ferramenta de busca/MCP do `context7` para obter a documentação atual do **Prisma** (custom filtering, query builders) e **Zod**.

---

## 📂 Diretórios & Arquivos Alvo
- `apps/api/zorde-erp-laboratorio/src/modules/fornecedor/domain/entities/fornecedor.entity.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/fornecedor/domain/repositories/i-fornecedor.repository.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/fornecedor/application/dtos/`
  - `criar-fornecedor.dto.ts`
  - `atualizar-fornecedor.dto.ts`
  - `fornecedor-response.dto.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/fornecedor/application/use-cases/`
  - `criar-fornecedor.use-case.ts`
  - `buscar-fornecedor.use-case.ts`
  - `listar-fornecedores.use-case.ts`
  - `atualizar-fornecedor.use-case.ts`
  - `deletar-fornecedor.use-case.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/fornecedor/application/services/fornecedor.service.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/fornecedor/infrastructure/repositories/prisma-fornecedor.repository.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/fornecedor/presentation/controllers/fornecedor.controller.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/fornecedor/fornecedor.module.ts`

---

## 📋 Checklist de Execução

### 1. Entidade de Domínio e Interface do Repositório
- [ ] Crie `src/modules/fornecedor/domain/entities/fornecedor.entity.ts`:
  - Mapear a classe pura `FornecedorEntity` contendo: `id`, `nome`, `email`, `contato` (opcional), `tipoPessoa` (enum `TipoPessoa`), `documento`, `status` (enum `StatusPessoa`), `cep`, `uf`, `cidade`, `logradouro`, `numero`, `bairro`, `observacao`, `usuarioId`, `createdAt`, `updatedAt`, `deletedAt` (Date | null).
- [ ] Crie `src/modules/fornecedor/domain/repositories/i-fornecedor.repository.ts`:
  - Interface `IFornecedorRepository` contendo os contratos:
    - `criar(fornecedor: FornecedorEntity): Promise<FornecedorEntity>`
    - `buscarPorId(id: number): Promise<FornecedorEntity | null>`
    - `listarPorUsuario(usuarioId: number): Promise<FornecedorEntity[]>` (Filtrar somente não excluídos logics)
    - `atualizar(id: number, fornecedor: Partial<FornecedorEntity>): Promise<FornecedorEntity>`
    - `deletarSoft(id: number): Promise<void>`
  - Exportar o token DI: `export const I_FORNECEDOR_REPOSITORY = 'IFornecedorRepository';`

### 2. DTOs de Aplicação (Zod)
- [ ] Crie os DTOs com validação Zod:
  - `CriarFornecedorDto`: `nome`, `email`, `contato` (opcional), `tipoPessoa` (validação contra enum `TipoPessoa`), `documento` (validação de formato de CPF/CNPJ), `status` (opcional, default `ATIVO`), endereço campos opcionais (`cep`, `uf`, `cidade`, `logradouro`, `numero`, `bairro`, `observacao`).
  - `AtualizarFornecedorDto`: Todos os campos anteriores opcionais.
  - `FornecedorResponseDto`: Mapper que serializa a entidade para formato JSON de saída.

### 3. Use Cases do CRUD
- [ ] **`criar-fornecedor.use-case.ts`**:
  - Injetar `IFornecedorRepository`. Receber DTO de criação + `usuarioId` logado.
  - Validar lógica de formato de CPF/CNPJ de acordo com a propriedade `tipoPessoa`.
  - Persistir e retornar.
- [ ] **`buscar-fornecedor.use-case.ts`**:
  - Receber ID do fornecedor + `usuarioId` logado (para garantir multi-tenancy).
  - Obter fornecedor. Se não existir ou se estiver excluído logicamente (`deletedAt` diferente de null), disparar `EntityNotFoundException`. Retornar DTO.
- [ ] **`listar-fornecedores.use-case.ts`**:
  - Buscar todos os fornecedores ativos pertencentes ao `usuarioId` fornecido no token do usuário logado.
- [ ] **`atualizar-fornecedor.use-case.ts`**:
  - Buscar fornecedor existente por ID e assegurar propriedade/autorização.
  - Executar o update parcial, validando novos valores.
- [ ] **`deletar-fornecedor.use-case.ts`**:
  - Buscar fornecedor ativo. Se não encontrado, lançar 404.
  - Invocar `deletarSoft(id)` que atualizará o campo `deleted_at` com o timestamp do momento atual, mantendo a linha salva física na tabela.

### 4. Repositório Prisma (Lógica de Soft Delete)
- [ ] Crie `prisma-fornecedor.repository.ts`:
  - Implementar os métodos CRUD com `PrismaService`.
  - **Importante**: Em todos os métodos de leitura (`buscarPorId`, `listarPorUsuario`, `atualizar`), incluir a cláusula `where: { deleted_at: null }` para que os registros deletados de forma lógica sejam ignorados de forma transparente.
  - No método `deletarSoft(id)`, executar um update de linha `update({ where: { id }, data: { deleted_at: new Date() } })`.

### 5. Controller Autenticado
- [ ] Crie `src/modules/fornecedor/presentation/controllers/fornecedor.controller.ts`:
  - `@Controller('api/fornecedores')` decorado com `@UseGuards(JwtAuthGuard)`.
  - Injetar `FornecedorService` facade.
  - Mapear os 5 métodos HTTP (POST, GET, GET /:id, PUT /:id, DELETE /:id).
  - Injetar o ID do usuário autenticado nos use cases a partir do decorator `@User('id')`.

### 6. Configuração do Módulo
- [ ] Configurar `src/modules/fornecedor/fornecedor.module.ts` declarando as injeções e exports correspondentes. Registrar o módulo no `AppModule` principal.

---

## 🎯 Critérios de Aceitação
1. Todas as rotas do controlador de fornecedores devem bloquear acesso anônimo disparando HTTP 401.
2. Fornecedores excluídos logicamente não podem retornar na rota de listagem ou busca individual, respondendo com HTTP 404 na busca direta.
3. A rota de exclusão DELETE `/api/fornecedores/:id` deve executar um update de timestamp na coluna `deleted_at` (soft delete).
