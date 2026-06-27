# Task 04: Módulo Auth — Domínio e Aplicação (Use Cases & DTOs)

## 📌 Objetivo
Esta tarefa consiste em implementar a lógica central de domínio e as regras de aplicação para o módulo de **Autenticação** (`apps/api/zorde-erp-laboratorio/src/modules/auth`), seguindo rigorosamente os padrões de **Clean Architecture** descritos em `docs/ARCHITECTURE.md`:
1. Mapeamento da classe de domínio pura `AutenticacaoEntity`.
2. Declaração da interface de porta `IAutenticacaoRepository` (e seu token de injeção de dependência).
3. Criação de use cases de autenticação (`LoginUseCase`, `RefreshTokenUseCase`, `LogoutUseCase`).
4. Definição de schemas Zod e DTOs de entrada e saída.
5. Fachada `AuthService` que serve como ponto único de entrada para o controller.

---

## 🛠️ MCP (`context7`) — Como Obter Ajuda de Documentação
Se precisar de exemplos sobre modelagem de use cases focados com inversão de dependência no NestJS ou inferência de tipos do Zod:
- Utilize a ferramenta de busca/MCP do `context7` para obter a documentação atual de Clean Architecture patterns, **Zod** e **NestJS**.

---

## 📂 Diretórios & Arquivos Alvo
- `apps/api/zorde-erp-laboratorio/src/modules/auth/domain/entities/autenticacao.entity.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/auth/domain/repositories/i-autenticacao.repository.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/auth/application/dtos/login.dto.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/auth/application/dtos/auth-response.dto.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/auth/application/use-cases/login.use-case.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/auth/application/use-cases/refresh-token.use-case.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/auth/application/use-cases/logout.use-case.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/auth/application/services/auth.service.ts`

---

## 📋 Checklist de Execução

### 1. Camada de Domínio (Pureza Arquitetural - Zero NestJS)
- [ ] Crie `src/modules/auth/domain/entities/autenticacao.entity.ts`:
  - Classe de domínio pura `AutenticacaoEntity` contendo as propriedades da tabela `autenticacao` mapeadas do Go:
    - `id` (número)
    - `idUsuario` (número)
    - `refreshToken` (string)
    - `status` (`StatusSessao` enum: `logado` | `offline`)
    - `ip` (string)
    - `dispositivo` (string)
    - `navegador` (string)
    - `createdAt` (Date)
    - `updatedAt` (Date ou undefined)
  - Incluir um construtor de inicialização simples e um método estático factory `create(params: ...)` se apropriado.
- [ ] Crie `src/modules/auth/domain/repositories/i-autenticacao.repository.ts`:
  - Definir a interface `IAutenticacaoRepository` contendo os contratos de persistência:
    - `criar(autenticacao: AutenticacaoEntity): Promise<AutenticacaoEntity>`
    - `buscarPorRefreshToken(refreshToken: string): Promise<AutenticacaoEntity | null>`
    - `atualizarStatus(id: number, status: StatusSessao): Promise<void>`
    - `deletarPorUsuario(idUsuario: number): Promise<void>`
  - Exportar o token de injeção de dependência associado:
    `export const IAUTENTICACAO_REPOSITORY = 'IAutenticacaoRepository';`

### 2. DTOs com Validação Zod
- [ ] Crie `src/modules/auth/application/dtos/login.dto.ts`:
  - Declarar o schema Zod `loginSchema` contendo:
    - `email` (string de formato email, obrigatório)
    - `senha` (string, tamanho mínimo de 6 caracteres, obrigatório)
  - Exportar a classe `LoginDto` e inferir a tipagem estática a partir do schema: `type TLogin = z.infer<typeof loginSchema>`.
- [ ] Crie `src/modules/auth/application/dtos/auth-response.dto.ts`:
  - Declarar a estrutura da resposta de login de sucesso:
    - `accessToken` (string)
    - `refreshToken` (string)
    - `usuario` (objeto contendo `id`, `nome`, `email`)

### 3. Use Cases do Módulo
Crie as classes de use cases injetáveis (`@Injectable()` de `@nestjs/common`) em `src/modules/auth/application/use-cases/`:
- [ ] **`login.use-case.ts`**:
  - Injetar repositório do usuário `IUsuarioRepository` (dependência externa do módulo de usuário) e repositório `IAutenticacaoRepository`.
  - Método `execute(dto: LoginDto, clientIp: string, clientUserAgent: string)`:
    - Buscar usuário por email. Se não existir ou a senha hashada Argon2id não bater (a verificação do Argon2 será chamada por serviço), disparar `UnauthorizedException`.
    - Gerar o token de fingerprint (SHA-256 de `IP|UA`).
    - Gerar tokens JWT (`accessToken` expira em 12h, `refreshToken` expira em 24h, contendo a claim `fingerprint` no payload).
    - Criar e salvar uma nova entidade `AutenticacaoEntity` (refresh token, IP, UserAgent parsed, dispositivo, etc.) no banco via repositório de autenticação com status inicial `logado`.
    - Retornar o `AuthResponseDto`.
- [ ] **`refresh-token.use-case.ts`**:
  - Método `execute(refreshToken: string, clientIp: string, clientUserAgent: string)`:
    - Buscar sessão de autenticação ativa via `buscarPorRefreshToken`. Se não encontrada ou se o status for `offline`, disparar `UnauthorizedException`.
    - Validar a assinatura e expiração do refresh token recebido. Se inválido, atualizar status da sessão para `offline` e disparar erro.
    - Validar o IP e o User-Agent recalculando o hash SHA-256 e comparando com o claim gravado no refresh token. Se não bater, revogar a sessão (status `offline`) e disparar erro.
    - Gerar novos tokens JWT e salvar a sessão atualizada com o novo refresh token.
- [ ] **`logout.use-case.ts`**:
  - Método `execute(userId: number)`:
    - Excluir ou invalidar (mudar status para `offline`) todas as sessões do usuário através de `deletarPorUsuario(userId)`.

### 4. Fachada do Módulo (`AuthService`)
- [ ] Crie `src/modules/auth/application/services/auth.service.ts`:
  - Classe `@Injectable()` que injeta os três use cases do módulo.
  - Expor métodos limpos (`login`, `refresh`, `logout`) que simplesmente orquestram as chamadas correspondentes, servindo como uma fachada de uso no controller.

---

## 🎯 Critérios de Aceitação
1. A camada de domínio não deve ter qualquer importação de bibliotecas externas ou decorators `@nestjs/common`, mantendo pureza de Clean Architecture.
2. Os schemas Zod de validação devem estar estruturados e prontos para acoplamento com o `ZodValidationPipe` da Task 03.
3. Os use cases de Login e Refresh Token devem contemplar a paridade do fingerprint de segurança do Go, validando sessões de forma estrita.
