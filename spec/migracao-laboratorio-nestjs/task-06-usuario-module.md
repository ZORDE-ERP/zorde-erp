# Task 06: Módulo Usuario — CRUD Completo Clean Architecture

## 📌 Objetivo
Esta tarefa consiste em implementar o módulo de **Usuário** (`apps/api/zorde-erp-laboratorio/src/modules/usuario`), responsável pela gerência e cadastro de usuários internos do sistema. A estrutura deve seguir estritamente as convenções de Clean Architecture e desacoplamento de persistência definidas no projeto:
1. Mapeamento da classe `UsuarioEntity`.
2. Criação da interface de porta `IUsuarioRepository` e seu token correspondente.
3. Criação de schemas Zod e DTOs de entrada e saída (ocultando a senha criptografada nas respostas).
4. Use cases de CRUD (`CriarUsuario`, `ListarUsuarios`, `AtualizarUsuario`, `DeletarUsuario`) com regras estritas de hash de senha (Argon2id) e unicidade de chaves únicas compostas.
5. Implementação do repositório Prisma concreto.
6. Controllers expondo rotas públicas (criação inicial) e rotas privadas protegidas pelo `JwtAuthGuard`.

---

## 🛠️ MCP (`context7`) — Como Obter Ajuda de Documentação
Se precisar de informações sobre tratamento de restrições de banco (Unique Constraints) com Prisma e NestJS ou validação de documentos com Zod:
- Utilize a ferramenta de busca/MCP do `context7` para obter a documentação atual do **Prisma** (error codes, unique handling) e **Zod** (refinement patterns).

---

## 📂 Diretórios & Arquivos Alvo
- `apps/api/zorde-erp-laboratorio/src/modules/usuario/domain/entities/usuario.entity.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/usuario/domain/repositories/i-usuario.repository.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/usuario/application/dtos/`
  - `criar-usuario.dto.ts`
  - `atualizar-usuario.dto.ts`
  - `usuario-response.dto.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/usuario/application/use-cases/`
  - `criar-usuario.use-case.ts`
  - `listar-usuarios.use-case.ts`
  - `atualizar-usuario.use-case.ts`
  - `deletar-usuario.use-case.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/usuario/application/services/usuario.service.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/usuario/infrastructure/repositories/prisma-usuario.repository.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/usuario/presentation/controllers/usuario.controller.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/usuario/usuario.module.ts`

---

## 📋 Checklist de Execução

### 1. Camada de Domínio e Porta do Repositório
- [ ] Crie `src/modules/usuario/domain/entities/usuario.entity.ts`:
  - Mapear a classe pura `UsuarioEntity` com: `id` (number), `email` (string), `senha` (string), `nome` (string), `documento` (string), `contato` (string), `ultimoAcesso` (Date | null), `createdAt` (Date), `updatedAt` (Date | null).
- [ ] Crie `src/modules/usuario/domain/repositories/i-usuario.repository.ts`:
  - Interface `IUsuarioRepository` declarando:
    - `criar(usuario: UsuarioEntity): Promise<UsuarioEntity>`
    - `buscarPorId(id: number): Promise<UsuarioEntity | null>`
    - `buscarPorEmail(email: string): Promise<UsuarioEntity | null>`
    - `buscarPorDocumento(documento: string): Promise<UsuarioEntity | null>`
    - `listar(): Promise<UsuarioEntity[]>`
    - `atualizar(id: number, usuario: Partial<UsuarioEntity>): Promise<UsuarioEntity>`
    - `deletar(id: number): Promise<void>`
  - Exportar o token DI: `export const I_USUARIO_REPOSITORY = 'IUsuarioRepository';`

### 2. DTOs de Aplicação (Zod)
- [ ] Crie `criar-usuario.dto.ts` com o schema Zod:
  - `email` (string, email format), `senha` (string, min 6 caracteres), `nome` (string), `documento` (string, CNPJ/CPF formatado ou seco), `contato` (string).
- [ ] Crie `atualizar-usuario.dto.ts` com o schema Zod:
  - Todos os campos de criação opcionais.
- [ ] Crie `usuario-response.dto.ts` com o mapper estático para converter `UsuarioEntity` ocultando explicitamente o campo `senha`.

### 3. Use Cases do CRUD
Implemente os use cases injetáveis (`@Injectable()`) com tratamento de regras de negócio:
- [ ] **`criar-usuario.use-case.ts`**:
  - Injetar `IUsuarioRepository` e `PasswordHashingService` (do modulo de Auth).
  - Verificar se já existe um usuário com o mesmo `email` ou `documento` (ou se viola a chave composta única `email + documento`). Em caso positivo, disparar `ConflictException`.
  - Hashing da senha usando `PasswordHashingService.hash()` antes da persistência.
  - Persistir e retornar o usuário criado serializado para o DTO de resposta.
- [ ] **`listar-usuarios.use-case.ts`**:
  - Buscar lista de usuários do repositório e retornar convertidos para `UsuarioResponseDto[]`.
- [ ] **`atualizar-usuario.use-case.ts`**:
  - Buscar usuário existente pelo ID. Se não encontrado, disparar `EntityNotFoundException`.
  - Se email ou documento estiverem sendo modificados, validar nova unicidade no banco (conflito 409).
  - Se senha for informada no body, gerar novo hash com `PasswordHashingService`.
  - Realizar o update parcial no banco e retornar entidade atualizada.
- [ ] **`deletar-usuario.use-case.ts`**:
  - Verificar existência pelo ID. Se não encontrado, disparar erro 404.
  - Chamar exclusão física no repositório.

### 4. Implementação do Repositório Prisma
- [ ] Crie `src/modules/usuario/infrastructure/repositories/prisma-usuario.repository.ts`:
  - Implementar `IUsuarioRepository` utilizando o `PrismaService` injetado.
  - Garantir o mapeamento correto entre as convenções JS/TS (camelCase) e os campos reais do banco de dados (snake_case) por meio de Mappers.

### 5. Apresentação (Controller)
- [ ] Crie `src/modules/usuario/presentation/controllers/usuario.controller.ts`:
  - `@Controller('api/usuarios')`. Injetar `UsuarioService` fachada.
  - **`POST /` (Público)**: Rota pública para criação de contas, valida body com o schema de criação e retorna 201.
  - **`GET /` (Autenticado - `@UseGuards(JwtAuthGuard)`)**: Retorna a lista completa de usuários cadastrados.
  - **`PUT /:id` (Autenticado)**: Atualiza dados parciais do usuário.
  - **`DELETE /:id` (Autenticado)**: Remove um usuário por ID.

### 6. Módulo Usuário (`usuario.module.ts`)
- [ ] Registrar e exportar `I_USUARIO_REPOSITORY` e `UsuarioService`.
- [ ] Importar `AuthModule` (ou registrar o provider de hash de senhas) e `DatabaseModule` para o escopo do módulo.
- [ ] Registrar o `UsuarioModule` no `AppModule` principal da API.

---

## 🎯 Critérios de Aceitação
1. A rota de criação de usuários `POST /api/usuarios` deve ser pública e validar dados de entrada.
2. Nenhuma resposta da API deve conter o hash da senha (`senha`) no JSON final de retorno.
3. Cadastro de duplicados (mesmo e-mail ou documento) deve falhar respondendo com status HTTP 409.
