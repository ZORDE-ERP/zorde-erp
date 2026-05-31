# Task 02: Configurações de Env, Enums e Tratamento de Erros

## 📌 Objetivo
Esta tarefa consiste em estabelecer os fundamentos do sistema do microsserviço `apps/api/zorde-erp-laboratorio`:
1. Validação estrita das variáveis de ambiente de runtime usando **Zod** integrada ao módulo `@nestjs/config`.
2. Criação dos enums de domínio essenciais compartilhados entre todos os módulos.
3. Arquitetura unificada de tratamento de erros baseada em Exceções de Domínio (puras, sem acoplamento HTTP) com um Filtro HTTP Global do NestJS para mapeamento automático dos status de resposta HTTP correspondentes.

---

## 🛠️ MCP (`context7`) — Como Obter Ajuda de Documentação
Se precisar de informações sobre configuração de Exception Filters no NestJS ou como validar variáveis de ambiente no `@nestjs/config` usando Zod:
- Utilize a ferramenta de busca/MCP do `context7` para obter a documentação atual do **NestJS** (ConfigModule validation, Exception Filters).

---

## 📂 Diretórios & Arquivos Alvo
- `apps/api/zorde-erp-laboratorio/src/config/env.validation.ts`
- `apps/api/zorde-erp-laboratorio/src/config/database.config.ts`
- `apps/api/zorde-erp-laboratorio/src/shared/enums/`
  - `tipo-pessoa.enum.ts`
  - `status-pessoa.enum.ts`
  - `tipo-servico.enum.ts`
  - `status-sessao.enum.ts`
- `apps/api/zorde-erp-laboratorio/src/shared/errors/`
  - `app.exception.ts`
  - `http-exception.filter.ts`

---

## 📋 Checklist de Execução

### 1. Configurações e Validação de Ambiente (Zod + NestJS Config)
- [ ] Crie o arquivo `src/config/env.validation.ts`:
  - Definir um schema **Zod** para validar as seguintes variáveis de ambiente:
    - `DATABASE_URL` (String, obrigatória, formato de URL PostgreSQL)
    - `POSTGRES_DB` (String, obrigatória)
    - `POSTGRES_USER` (String, obrigatória)
    - `POSTGRES_PASSWORD` (String, obrigatória)
    - `API_PORT` (Número transformado de string, default: 3000)
    - `JWT_SECRET` (String, obrigatória)
    - `APP_ENV` (Enum: `development`, `production`, `test`, default: `development`)
    - `RESEND_API_KEY` (String, obrigatória)
  - Criar uma função de validação exportada (`validateEnv(config: Record<string, any>)`) que receba o objeto de envs do NestJS, execute o schema Zod `.parse()` e retorne o resultado, disparando erro detalhado caso a validação falhe.
- [ ] Crie o arquivo `src/config/database.config.ts`:
  - Exportar um factory de configuração registrada pelo NestJS `@nestjs/config` contendo as credenciais de banco organizadas.

### 2. Criação dos Enums de Domínio
Crie cada um dos enums a seguir em `src/shared/enums/` de acordo com a especificação (usando export enums TypeScript):
- [ ] **`tipo-pessoa.enum.ts`**:
  ```typescript
  export enum TipoPessoa {
    FISICA = 'FISICA',
    JURIDICA = 'JURIDICA',
  }
  ```
- [ ] **`status-pessoa.enum.ts`**:
  ```typescript
  export enum StatusPessoa {
    ATIVO = 'ATIVO',
    INATIVO = 'INATIVO',
  }
  ```
- [ ] **`tipo-servico.enum.ts`**:
  ```typescript
  export enum TipoServico {
    MONTAGEM_SIMPLES = 'MONTAGEM SIMPLES',
    PARAFUSO = 'PARAFUSO',
    TRANSPOSICAO = 'TRANSPOSICAO',
    COLORACAO = 'COLORACAO',
    SOMENTE_ENCAIXAR = 'SOMENTE ENCAIXAR',
  }
  ```
- [ ] **`status-sessao.enum.ts`**:
  ```typescript
  export enum StatusSessao {
    LOGADO = 'logado',
    OFFLINE = 'offline',
  }
  ```

### 3. Sistema de Exceções de Domínio (`app.exception.ts`)
- [ ] Crie a exceção abstrata de domínio `AppException` estendendo a classe global `Error` em `src/shared/errors/app.exception.ts`.
  - Esta classe deve conter uma propriedade `statusCode` (padrão HTTP recomendado ou um tipo customizado que identifique a natureza do erro).
  - Criar especializações filhas concretas para facilitar o mapeamento:
    - `EntityNotFoundException` (ex: recurso não encontrado, HTTP 404)
    - `ConflictException` (ex: e-mail ou documento duplicado, HTTP 409)
    - `BusinessRuleException` (ex: regra de negócio violada, HTTP 400)
    - `UnauthorizedException` (ex: senha incorreta ou sessão expirada, HTTP 401)

### 4. Filtro de Exceções Global HTTP (`http-exception.filter.ts`)
- [ ] Crie `src/shared/errors/http-exception.filter.ts`:
  - Decorar a classe com `@Catch()` capturando exceções do tipo `AppException` e também as gerais `HttpException` do NestJS.
  - Implementar a interface `ExceptionFilter` com o método `catch(exception: any, host: ArgumentsHost)`.
  - O filtro deve formatar a resposta do erro em um padrão corporativo premium:
    - Retornar um JSON contendo: `statusCode`, `message` (legível para o usuário final), `error` (tipo da exceção ou descrição curta), `timestamp` (data ISO) e `path` (URL requisitada).
    - Mapear corretamente as exceções de domínio criadas no passo anterior para os status codes HTTP corretos (404 para NotFound, 409 para Conflict, 400 para BusinessRule, 401 para Unauthorized).
- [ ] Registrar o `HttpExceptionFilter` como um provider global no `AppModule` ou no arquivo de entrada `main.ts` usando `app.useGlobalFilters(new HttpExceptionFilter())`.

---

## 🎯 Critérios de Aceitação
1. A inicialização do app NestJS deve falhar imediatamente na inicialização se alguma variável de ambiente requerida (ex: `DATABASE_URL`) não estiver presente no arquivo `.env`.
2. Os 4 enums devem ser declarados com strings explícitas e exportados corretamente.
3. Se um use case disparar `EntityNotFoundException`, a API deve retornar uma resposta JSON contendo o status HTTP 404 estruturado, sem vazamento de stacktrace interno para o cliente externo.
