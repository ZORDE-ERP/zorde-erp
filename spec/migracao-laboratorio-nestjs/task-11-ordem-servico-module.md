# Task 11: Módulo Ordem de Serviço — CRUD e Regras de Relações

## 📌 Objetivo
Esta tarefa consiste em implementar o módulo de **Ordem de Serviço** (`apps/api/zorde-erp-laboratorio/src/modules/ordemDeServico`), responsável por gerenciar as ordens de serviço emitidas no sistema. Este módulo integra chaves estrangeiras complexas de múltiplos domínios (`Cliente` e `TabelaMontagem`), exigindo validação de integridade referencial rigorosa antes de persistir dados:
1. Mapeamento da classe de domínio pura `OrdemDeServicoEntity`.
2. Criação da interface de repositório `IOrdemDeServicoRepository` e seu token DI correspondente.
3. Criação de schemas Zod e DTOs de entrada e saída, validando opcionalidade do preço e chaves estrangeiras, retornando relacionamentos aninhados para o cliente: `cliente { id, nome }` e `tabelaMontagem { id, servico }`.
4. Use cases de CRUD (`Criar`, `Buscar`, `Listar`, `Atualizar`, `Deletar` - Soft) com checagem de existência ativa de `Cliente` e `TabelaMontagem` (garantindo que a tabela de montagem realmente pertence ao cliente informado).
5. Implementação do repositório Prisma com suporte a carregamento de relacionamentos (`include`) e Soft Delete.
6. Controllers protegidos pelo `JwtAuthGuard`.

---

## 🛠️ MCP (`context7`) — Como Obter Ajuda de Documentação
Se precisar de detalhes sobre como estruturar relacionamentos Prisma ou gerenciar validações compostas em use cases NestJS:
- Utilize a ferramenta de busca/MCP do `context7` para obter a documentação atual do **Prisma** (relations, eager loading, prisma includes) e **Zod**.

---

## 📂 Diretórios & Arquivos Alvo
- `apps/api/zorde-erp-laboratorio/src/modules/ordemDeServico/domain/entities/ordem-de-servico.entity.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/ordemDeServico/domain/repositories/i-ordem-de-servico.repository.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/ordemDeServico/application/dtos/`
  - `criar-ordem.dto.ts`
  - `atualizar-ordem.dto.ts`
  - `ordem-de-servico-response.dto.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/ordemDeServico/application/use-cases/`
  - `criar-ordem.use-case.ts`
  - `buscar-ordem.use-case.ts`
  - `listar-ordem.use-case.ts`
  - `atualizar-ordem.use-case.ts`
  - `deletar-ordem.use-case.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/ordemDeServico/application/services/ordem-de-servico.service.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/ordemDeServico/infrastructure/repositories/prisma-ordem-de-servico.repository.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/ordemDeServico/presentation/controllers/ordem-de-servico.controller.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/ordemDeServico/ordem-de-servico.module.ts`

---

## 📋 Checklist de Execução

### 1. Camada de Domínio e Porta do Repositório
- [ ] Crie `src/modules/ordemDeServico/domain/entities/ordem-de-servico.entity.ts`:
  - Definir `OrdemDeServicoEntity` contendo: `id`, `codigoOs` (string), `clienteId`, `valor` (number | null), `tabelaMontagemId` (number | null), `usuarioId`, `createdAt`, `updatedAt`, `deletedAt` (Date | null).
- [ ] Crie `src/modules/ordemDeServico/domain/repositories/i-ordem-de-servico.repository.ts`:
  - Interface `IOrdemDeServicoRepository` contendo os contratos:
    - `criar(ordem: OrdemDeServicoEntity): Promise<OrdemDeServicoEntity>`
    - `buscarPorId(id: number): Promise<OrdemDeServicoEntity | null>`
    - `listarPorUsuario(usuarioId: number): Promise<OrdemDeServicoEntity[]>` (Exclui deletados)
    - `atualizar(id: number, ordem: Partial<OrdemDeServicoEntity>): Promise<OrdemDeServicoEntity>`
    - `deletarSoft(id: number): Promise<void>`
  - Token DI: `export const I_ORDEM_DE_SERVICO_REPOSITORY = 'IOrdemDeServicoRepository';`

### 2. DTOs de Aplicação (Zod)
- [ ] Crie os DTOs com validação Zod:
  - `CriarOrdemDto`: `codigoOs` (string, obrigatório), `clienteId` (inteiro, obrigatório), `valor` (float opcional), `tabelaMontagemId` (inteiro opcional).
  - `AtualizarOrdemDto`: Todos os campos anteriores opcionais.
  - `OrdemDeServicoResponseDto`: Mapper que retorna o body enriquecido incluindo objetos relacionais simplificados de `cliente` (`id`, `nome`) e `tabelaMontagem` (`id`, `servico`).

### 3. Use Cases com Validação de Integridade Referencial
- [ ] **`criar-ordem.use-case.ts`**:
  - Injetar `IOrdemDeServicoRepository`, `IClienteRepository` e `ITabelaMontagemRepository`.
  - Validar se `clienteId` existe e está ativo no banco (lançar `EntityNotFoundException` caso negativo).
  - Se `tabelaMontagemId` for fornecido:
    - Validar existência da tabela de montagem correspondente.
    - **Regra Crucial de Integridade**: Validar se a `tabelaMontagem` realmente pertence ao `clienteId` informado na requisição (`tabela.clienteId === clienteId`). Caso contrário, disparar `BusinessRuleException` (A tabela de montagem selecionada não pertence ao cliente informado).
  - Definir `usuarioId` da OS com o ID do usuário logado.
  - Persistir e retornar.
- [ ] **`buscar-ordem.use-case.ts`**:
  - Buscar ordem pelo ID. Se não encontrada ou deletada logicamente, disparar `EntityNotFoundException` (Código 404).
  - Retornar DTO de resposta contendo os relacionamentos carregados do banco.
- [ ] **`listar-ordem.use-case.ts`**:
  - Buscar ordens do usuário logado filtrando fora as deletadas logicamente.
- [ ] **`atualizar-ordem.use-case.ts`**:
  - Buscar ordem existente. Garantir propriedade do usuário.
  - Se `clienteId` ou `tabelaMontagemId` estiverem sendo modificados, re-executar as mesmas validações relacionais do use case de criação.
  - Executar update parcial e retornar.
- [ ] **`deletar-ordem.use-case.ts`**:
  - Garantir existência e executar exclusão lógica (`deletedAt = new Date()`).

### 4. Repositório Prisma (Carregamento de Relações)
- [ ] Crie `prisma-ordem-de-servico.repository.ts`:
  - Implementar os métodos CRUD estendendo o `PrismaService`.
  - Nos métodos de leitura (`buscarPorId`, `listarPorUsuario`, `atualizar`), incluir `include: { cliente: true, tabelaMontagem: true }` para garantir o eager loading das relações requeridas pelas respostas.
  - Filtrar em todas as listagens e buscas `deleted_at: null` para manter a paridade do Soft Delete.

### 5. Controller Autenticado
- [ ] Crie `src/modules/ordemDeServico/presentation/controllers/ordem-de-servico.controller.ts`:
  - Mapear endpoints CRUD sob `@Controller('api/ordens-de-servico')` protegidos com `@UseGuards(JwtAuthGuard)`.
  - Injetar o ID do usuário autenticado a partir do decorator `@CurrentUser('id')`.

### 6. Configuração do Módulo
- [ ] Configurar `src/modules/ordemDeServico/ordem-de-servico.module.ts`. Importar `ClienteModule` e `TabelaMontagemModule` para ter acesso aos seus respectivos repositórios. Registrar no `AppModule` principal.

---

## 🎯 Critérios de Aceitação
1. Tentar cadastrar uma OS referenciando um cliente que não possui registro ativo no banco deve lançar HTTP 404.
2. Tentar cadastrar uma OS para um cliente informando uma `tabelaMontagemId` que pertence a OUTRO cliente deve falhar respondendo com HTTP 400.
3. O retorno de busca individual de uma OS deve conter os dados detalhados aninhados do cliente e do serviço associado.
