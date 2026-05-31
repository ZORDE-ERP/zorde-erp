# Task 13: Infraestrutura de Testes Unitários e End-to-End (E2E)

## 📌 Objetivo
Esta tarefa consiste em configurar e implementar a infraestrutura completa de testes automáticos para o microsserviço `apps/api/zorde-erp-laboratorio` usando **Jest**. Seguindo a Clean Architecture, os testes devem cobrir duas frentes principais:
1. **Testes Unitários** (`test/unit/`): Cobrindo as regras de negócio puras dos Use Cases mais críticos (`LoginUseCase`, `SolicitarCadastroUseCase`, `CriarOrdemUseCase`) fazendo uso de mocks das interfaces (portas) de repositório.
2. **Testes End-to-End (E2E)** (`test/e2e/`): Cobrindo o fluxo completo da API (HTTP request → controller → use case → prisma → DB de teste) testando rotas públicas, privadas, cookies de fingerprint e respostas de erro estruturadas usando `supertest`.

---

## 🛠️ MCP (`context7`) — Como Obter Ajuda de Documentação
Se precisar de suporte sobre como mockar repositórios em TypeScript ou configurar um banco de dados de teste isolado usando Prisma e Jest:
- Utilize a ferramenta de busca/MCP do `context7` para obter a documentação atual do **Jest** (mocking classes, function mocks) e **NestJS Testing** (`TestingModule` configuration, E2E setup).

---

## 📂 Diretórios & Arquivos Alvo
- `apps/api/zorde-erp-laboratorio/jest.config.ts` (ou configurações no `package.json` para test unit e e2e)
- `apps/api/zorde-erp-laboratorio/test/jest-e2e.json` (configuração do jest para rotinas de integração)
- `apps/api/zorde-erp-laboratorio/test/unit/`
  - `login.use-case.spec.ts`
  - `solicitar-cadastro.use-case.spec.ts`
- `apps/api/zorde-erp-laboratorio/test/e2e/`
  - `auth.e2e-spec.ts`
  - `test-database-helper.ts` (Utilitário para resetar banco de testes)

---

## 📋 Checklist de Execução

### 1. Configuração do Ambiente de Testes (Jest)
- [ ] Crie ou atualize o arquivo de configuração do Jest (`test/jest-e2e.json` e o `package.json` local):
  - Definir mapeamento de caminhos (tsconfig paths) para que o Jest resolva imports usando aliases (ex: `@/shared/...`).
  - Configurar setup scripts para injetar variáveis de ambiente do banco de testes (ex: `DATABASE_URL` direcionando para um banco isolado `zorde_lab_test` para evitar corrupção de dados de desenvolvimento).

### 2. Criação de Testes Unitários (Use Cases Críticos)
Crie arquivos de spec unitários usando `@nestjs/testing`:
- [ ] **`test/unit/login.use-case.spec.ts`**:
  - Mockar o repositório de usuários `IUsuarioRepository` (retornando mock de usuário cadastrado e mock de falha para e-mail inexistente).
  - Mockar o repositório `IAutenticacaoRepository` (simular criação e persistência de sessões).
  - Mockar o `PasswordHashingService` (simular batimento de hashes correto e incorreto).
  - Testar fluxos:
    - Login bem-sucedido com emissão de tokens.
    - Falha de e-mail incorreto disparando `UnauthorizedException`.
    - Falha de senha incorreta disparando `UnauthorizedException`.
- [ ] **`test/unit/solicitar-cadastro.use-case.spec.ts`**:
  - Mockar `IUsuarioRepository`, `ISolicitacaoCadastroRepository` e `ResendEmailService`.
  - Testar fluxos:
    - Solicitação bem-sucedida (gera OTP, salva no banco com expiração e dispara o e-mail via Resend).
    - Tentativa de solicitar cadastro para e-mail que já possui conta ativa (deve disparar `ConflictException` sem enviar e-mail).

### 3. Utilitário de Reset do Banco de Testes E2E
- [ ] Crie `test/e2e/test-database-helper.ts`:
  - Utilitário contendo métodos para resetar as tabelas antes/depois de cada teste (ex: excluindo dados em cascata ou limpando as tabelas `usuarios`, `clientes`, `autenticacao`, `solicitacao_cadastro` via Prisma Client direto de testes).

### 4. Criação de Testes End-to-End (E2E)
- [ ] Crie `test/e2e/auth.e2e-spec.ts`:
  - Inicializar a aplicação NestJS usando `Test.createTestingModule` com `INestApplication`.
  - Ativar os pipes e filters globais (como o `ZodValidationPipe` e o `HttpExceptionFilter`).
  - Executar chamadas reais via `supertest(app.getHttpServer())`:
    - **Cenário 1: POST `/api/auth/login`**:
      - Payload correto de credenciais. Validar se a resposta contém o `accessToken` e se o header `Set-Cookie` contém o cookie `Fgp` estruturado de forma segura (HttpOnly).
      - Payload incorreto ou sem e-mail (validar resposta HTTP 400 Bad Request detalhada do `ZodValidationPipe`).
    - **Cenário 2: GET `/api/clientes` (Rota Protegida)**:
      - Tentar acessar sem token JWT (deve responder HTTP 401).
      - Acessar com token JWT correto, mas sem o cookie correspondente `Fgp` (deve barrar com HTTP 401 do fingerprinting).
      - Acessar com token + cookie correspondente (deve retornar HTTP 200).

---

## 🎯 Critérios de Aceitação
1. Os testes unitários devem rodar de forma isolada sem disparar conexões físicas com o banco de dados real.
2. A rotina `npm run test` (unitários) e `npm run test:e2e` (de integração/E2E) devem rodar com 100% de sucesso.
3. Os testes de integração E2E devem usar um banco de dados de teste isolado e limpar/resetar o banco entre cada suite de teste para evitar poluição.
