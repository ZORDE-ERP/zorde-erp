# Task 05: Módulo Auth — Infraestrutura e Apresentação (Argon2, Repos e Controller)

## 📌 Objetivo
Esta tarefa consiste em concluir o módulo de **Autenticação** (`apps/api/zorde-erp-laboratorio/src/modules/auth`), conectando a lógica de negócio à infraestrutura real:
1. Implementação de criptografia **Argon2id** nativa com os exatos parâmetros de hardware utilizados no projeto legado em Go.
2. Implementação concreta `PrismaAutenticacaoRepository` usando o `PrismaService` desenvolvido na Task 01.
3. Criação do `AuthController` contendo endpoints públicos e protegidos.
4. Escrita do Middleware/Estratégia de validação de cookies HttpOnly (`Fgp` ou `__Secure-Fgp`) que previne sequestros de sessão (Session Hijacking).
5. Configuração e declaração completa do NestJS `AuthModule`.

---

## 🛠️ MCP (`context7`) — Como Obter Ajuda de Documentação
Se precisar de informações sobre como configurar a biblioteca `argon2` no Node.js ou lidar com cookies HttpOnly em controladores NestJS:
- Utilize a ferramenta de busca/MCP do `context7` para obter a documentação atual do **argon2** (Node.js) e do **NestJS** (Express Response cookies manipulation).

---

## 📂 Diretórios & Arquivos Alvo
- `apps/api/zorde-erp-laboratorio/src/modules/auth/infra/services/password-hashing.service.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/auth/infra/repositories/prisma-autenticacao.repository.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/auth/presentation/controllers/auth.controller.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/auth/auth.module.ts`

---

## 📋 Checklist de Execução

### 1. Serviço de Hash Argon2id (Paridade de Criptografia com Go)
- [ ] Crie `src/modules/auth/infra/services/password-hashing.service.ts`:
  - Utilizar a biblioteca `argon2` instalada no npm.
  - Implementar um serviço contendo dois métodos: `hash(senha: string): Promise<string>` e `comparar(senha: string, hash: string): Promise<boolean>`.
  - Configurar **estritamente** os seguintes parâmetros no Argon2 para manter compatibilidade com o hash legacy em Go:
    - **`type`**: `argon2.argon2id` (ou 2 para Argon2id)
    - **`timeCost`**: `3` (iterações)
    - **`memoryCost`**: `65536` (64MB em KB: 64 * 1024 = 65536)
    - **`parallelism`**: `4` (threads)
    - **`hashLength`**: `32` (key length de saída)

### 2. Implementação Concreta do Repositório Prisma
- [ ] Crie `src/modules/auth/infra/repositories/prisma-autenticacao.repository.ts`:
  - Implementar a interface `IAutenticacaoRepository` criada na Task 04.
  - Injetar o `PrismaService` global.
  - Mapear a entidade de domínio `AutenticacaoEntity` para o modelo do banco de dados Prisma e vice-versa (Mappers).
  - Codificar os métodos CRUD respeitando concorrência e retorno assíncrono.

### 3. Controller de Autenticação (`AuthController`)
- [ ] Crie `src/modules/auth/presentation/controllers/auth.controller.ts`:
  - Decorar a classe com `@Controller('api/auth')`.
  - Injetar o `AuthService` fachada.
  - **Endpoint `POST /login`** (Público):
    - Validar o payload recebido (email e senha) usando `ZodValidationPipe` com o `loginSchema`.
    - Capturar o IP e User-Agent do request Express (`req.ip`, `req.headers['user-agent']`).
    - Invocar `authService.login()`.
    - No sucesso, gerar o cookie de fingerprint seguro:
      - Nome: `Fgp` (ou `__Secure-Fgp` em produção se HTTPS ativo).
      - Valor: hash de fingerprint SHA-256 gerado.
      - Opções do Cookie: `httpOnly: true`, `secure: true` (se prod), `sameSite: 'strict'`, `maxAge: 86400000` (24 horas). Anexar na response HTTP usando o decorator `@Res({ passthrough: true })`.
      - Retornar o DTO de sucesso contendo o `accessToken` no body.
  - **Endpoint `POST /refresh`** (Público):
    - Extrair o `refreshToken` do payload ou dos headers.
    - Capturar o IP/User-Agent atuais e o cookie `Fgp` presente na requisição.
    - Invocar `authService.refresh()`.
    - Se bem sucedido, atualizar o cookie `Fgp` com a nova resposta e retornar o novo `accessToken`.
  - **Endpoint `POST /logout`** (Autenticado - `@UseGuards(JwtAuthGuard)`):
    - Extrair o usuário autenticado a partir do decorator `@CurrentUser()`.
    - Invocar `authService.logout(usuario.id)`.
    - Limpar o cookie de fingerprint na resposta (`response.clearCookie('Fgp')`).
    - Retornar status HTTP 200/204.

### 4. Arquivo de Módulo NestJS (`auth.module.ts`)
- [ ] Implemente `src/modules/auth/auth.module.ts`:
  - Registrar os imports necessários: `JwtModule` (configurado dinamicamente ou estaticamente com `JWT_SECRET`), `DatabaseModule`, `@nestjs/config`.
  - Registrar no array de `providers`:
    - `{ provide: I_AUTENTICACAO_REPOSITORY, useClass: PrismaAutenticacaoRepository }`
    - `PasswordHashingService` (e outros serviços necessários)
    - `LoginUseCase`, `RefreshTokenUseCase`, `LogoutUseCase`
    - `AuthService`
  - Exportar o `AuthService`, `I_AUTENTICACAO_REPOSITORY` e `JwtModule` para outros módulos.

---

## 🎯 Critérios de Aceitação
1. Senhas criptografadas pelo backend em Go legado com Argon2id devem ser validadas perfeitamente pelo NestJS com sucesso (testar paridade de parâmetros de hash).
2. O cookie de segurança `Fgp` deve ser emitido estritamente com a flag `HttpOnly` ativa, impedindo leitura via JavaScript cliente (`document.cookie`).
3. O módulo `AuthModule` deve compilar sem dependências circulares.
