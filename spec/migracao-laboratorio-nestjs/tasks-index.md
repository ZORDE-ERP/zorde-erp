# Índice de Tasks — Migração Laboratorio-Go → NestJS

Este índice mapeia a sequência completa de tarefas projetadas para migrar o backend em Go (`apps/api/laboratorio-go`) para NestJS (`apps/api/zorde-erp-laboratorio`). Cada tarefa foi estruturada para ser executada de forma independente por subagents focados, garantindo que o escopo e contexto caibam confortavelmente nas janelas de contexto dos LLMs.

> [!IMPORTANT]
> **Padrão de Nomenclatura no Disco:**
> Diferente de alguns termos descritos no `spec.md`, a estrutura real de diretórios no disco de `apps/api/zorde-erp-laboratorio` já foi gerada com a convenção **camelCase** para nomes compostos nos módulos.
> Mantenha e siga este padrão:
> - `ordemDeServico` (para ordem-servico)
> - `tabelaMontagem` (para tabela-servico ou tabela-montagem)
> - `solicitacaoCadastro` (deve ser criado neste padrão caso não exista)

---

## 🗺️ Mapa de Execução das Tasks

Abaixo está a ordem lógica de execução. Algumas tarefas podem ser resolvidas em paralelo após os módulos de base estarem concluídos.

| Task ID | Título da Task | Escopo Principal | Dependências |
| :--- | :--- | :--- | :--- |
| **[Task 01](file:///home/luisguilherme/Documentos/projetos/backends/zorde-repo/spec/migracao-laboratorio-nestjs/task-01-prisma-setup.md)** | **Modelagem e Infraestrutura do Banco (Prisma)** | Criar `schema.prisma` com os 7 modelos, mapeamentos, índices, relações, configurar `PrismaService` e `DatabaseModule`. | Nenhuma |
| **[Task 02](file:///home/luisguilherme/Documentos/projetos/backends/zorde-repo/spec/migracao-laboratorio-nestjs/task-02-core-shared-setup.md)** | **Configurações de Env, Enums e Tratamento de Erros** | Validação de `.env` com Zod, classes customizadas de Exceções de Domínio e filtro HTTP Exception global NestJS. | Nenhuma |
| **[Task 03](file:///home/luisguilherme/Documentos/projetos/backends/zorde-repo/spec/migracao-laboratorio-nestjs/task-03-pipes-decorators-guards.md)** | **Infraestrutura Compartilhada: Pipes, Decorators e Guards** | Criar `ZodValidationPipe`, decorator `CurrentUser` e `JwtAuthGuard` com validação de token + fingerprint. | Task 02 |
| **[Task 04](file:///home/luisguilherme/Documentos/projetos/backends/zorde-repo/spec/migracao-laboratorio-nestjs/task-04-auth-domain-application.md)** | **Módulo Auth: Domínio e Aplicação (Use Cases & DTOs)** | Criar `AutenticacaoEntity`, interface do repositório, DTOs com Zod, `LoginUseCase`, `RefreshTokenUseCase` e `LogoutUseCase`. | Task 01, Task 03 |
| **[Task 05](file:///home/luisguilherme/Documentos/projetos/backends/zorde-repo/spec/migracao-laboratorio-nestjs/task-05-auth-infra-presentation.md)** | **Módulo Auth: Infraestrutura e Apresentação (Argon2, Repos e Controller)** | Criptografia Argon2id, `PrismaAutenticacaoRepository`, Passport JWT strategy, controllers e rotas públicas. | Task 04 |
| **[Task 06](file:///home/luisguilherme/Documentos/projetos/backends/zorde-repo/spec/migracao-laboratorio-nestjs/task-06-usuario-module.md)** | **Módulo Usuario: CRUD Completo Clean Architecture** | CRUD de usuários internos: domínio, regras de unicidade de email/documento, password hash, controllers e rotas. | Task 01, Task 05 |
| **[Task 07](file:///home/luisguilherme/Documentos/projetos/backends/zorde-repo/spec/migracao-laboratorio-nestjs/task-07-solicitacao-cadastro.md)** | **Módulo Solicitação Cadastro: Validação OTP & Integração Resend** | Gerador OTP de 6 dígitos seguro, envio de email via Resend, use cases de solicitação, verificação e reenvio, e controller. | Task 01, Task 02 |
| **[Task 08](file:///home/luisguilherme/Documentos/projetos/backends/zorde-repo/spec/migracao-laboratorio-nestjs/task-08-cliente-module.md)** | **Módulo Cliente: CRUD Completo com Soft Delete** | CRUD de clientes PF/PJ, validações Zod, status ativo/inativo, controle de soft delete e rotas autenticadas. | Task 01, Task 03 |
| **[Task 09](file:///home/luisguilherme/Documentos/projetos/backends/zorde-repo/spec/migracao-laboratorio-nestjs/task-09-fornecedor-module.md)** | **Módulo Fornecedor: CRUD Completo com Soft Delete** | CRUD de fornecedores (PF/PJ), soft delete, validações Zod e rotas autenticadas. | Task 01, Task 03 |
| **[Task 10](file:///home/luisguilherme/Documentos/projetos/backends/zorde-repo/spec/migracao-laboratorio-nestjs/task-10-tabela-servico-module.md)** | **Módulo Tabela Montagem: CRUD com Paginação e Busca** | Tabela de serviços montagem por cliente com filtros avançados `ILIKE`, paginação e validação do enum `TipoServico`. | Task 01, Task 08 |
| **[Task 11](file:///home/luisguilherme/Documentos/projetos/backends/zorde-repo/spec/migracao-laboratorio-nestjs/task-11-ordem-servico-module.md)** | **Módulo Ordem de Serviço: CRUD e Regras de Relações** | Abertura/atualização de OS com validação de dependências de `Cliente` e `TabelaMontagem`, retorno com relacionamentos. | Task 01, Task 08, Task 10 |
| **[Task 12](file:///home/luisguilherme/Documentos/projetos/backends/zorde-repo/spec/migracao-laboratorio-nestjs/task-12-docker-orchestration.md)** | **Orquestração de Infraestrutura: Docker & Compose** | Dockerfile multi-stage otimizado para o microsserviço NestJS, `docker-compose.yaml` com Postgres 16 e healthchecks. | Nenhuma |
| **[Task 13](file:///home/luisguilherme/Documentos/projetos/backends/zorde-repo/spec/migracao-laboratorio-nestjs/task-13-testing-setup.md)** | **Infraestrutura de Testes Unitários e End-to-End (E2E)** | Configuração de Jest, factories e testes unitários dos use cases mais críticos e testes E2E integrados com banco de teste. | Todas |

---

## 🛠️ Instrução Geral de Uso de MCP (`context7`)

Cada subagent deve fazer uso do servidor MCP `context7` configurado no ambiente.
- **Prisma 4 / Prisma 6**: Use para consultar as melhores práticas e APIs de mapeamento, transações e filtragem de relacionamentos.
- **NestJS**: Use para esclarecer padrões de injeção de dependência via tokens string (`@Inject`), guards e exception filters.
- **Zod**: Use para validar os schemas complexos com refinamentos necessários e tipagem inferida de entrada de dados.
