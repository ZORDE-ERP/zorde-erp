# Task 03: Infraestrutura Compartilhada — Pipes, Decorators e Guards

## 📌 Objetivo
Esta tarefa consiste em implementar as utilidades de infraestrutura compartilhada indispensáveis para a segurança e validação das requisições HTTP:
1. **`ZodValidationPipe`**: Pipe customizado de validação NestJS que recebe schemas do **Zod** para validar os payloads das requisições HTTP de forma estrita.
2. **`CurrentUser`**: Decorador customizado de parâmetros para extrair diretamente do contexto HTTP as claims do usuário autenticado no JWT.
3. **`JwtAuthGuard`**: Guard de autenticação que intercepta as rotas protegidas, valida a assinatura do JWT (Bearer Token) e implementa a paridade de segurança do Go, validando o fingerprint SHA-256 extraído do Cookie HttpOnly (`Fgp` ou `__Secure-Fgp`) contra o hash gerado a partir do IP e User-Agent do cliente.

---

## 🛠️ MCP (`context7`) — Como Obter Ajuda de Documentação
Se precisar de informações sobre integração do Zod com NestJS Pipes, criação de Guards customizados ou criptografia nativa no Node.js (`crypto`):
- Utilize a ferramenta de busca/MCP do `context7` para obter a documentação atual do **NestJS** e do **Zod** (Zod schemas, NestJS Guards, Custom Decorators).

---

## 📂 Diretórios & Arquivos Alvo
- `apps/api/zorde-erp-laboratorio/src/shared/pipes/zod-validation.pipe.ts`
- `apps/api/zorde-erp-laboratorio/src/shared/decorators/current-user.decorator.ts`
- `apps/api/zorde-erp-laboratorio/src/shared/guards/jwt-auth.guard.ts`

---

## 📋 Checklist de Execução

### 1. Custom Zod Validation Pipe
- [ ] Crie o arquivo `src/shared/pipes/zod-validation.pipe.ts`:
  - A classe deve implementar `PipeTransform` do NestJS.
  - Receber o schema Zod no construtor: `constructor(private schema: ZodSchema) {}`.
  - No método `transform(value: any, metadata: ArgumentMetadata)`, validar o `value` usando `this.schema.safeParse(value)`.
  - Se a validação falhar (`success: false`):
    - Mapear os erros do Zod (`error.errors`) em uma lista amigável contendo o campo (`path`) e a mensagem de erro.
    - Disparar uma exceção de validação (ex: `BadRequestException` ou `BusinessRuleException` contendo o payload detalhado dos erros) para que seja capturada pelo global exception filter.
  - Se a validação passar, retornar o valor limpo e tipado parseado pelo Zod.

### 2. Custom Current User Decorator
- [ ] Crie o arquivo `src/shared/decorators/current-user.decorator.ts`:
  - Utilizar `createParamDecorator` do NestJS.
  - Extrair o objeto `request` a partir do `ExecutionContext` (`host.switchToHttp().getRequest()`).
  - Retornar a propriedade `request.user` contendo as claims do usuário autenticado no JWT (id, nome, email, fingerprint).

### 3. JWT Guard com Validação de Fingerprint Cookie
- [ ] Crie o arquivo `src/shared/guards/jwt-auth.guard.ts`:
  - Deve implementar a interface `CanActivate` do NestJS (ou estender `AuthGuard('jwt')` da biblioteca `@nestjs/passport` adaptada).
  - Injetar o `JwtService` no construtor para verificar os tokens JWT.
  - No método `canActivate(context: ExecutionContext)`:
    - Obter o request HTTP do contexto do Express (`http.getRequest()`).
    - Extrair o token Bearer do header `Authorization` (formato `Bearer <token>`). Se não existir, disparar `UnauthorizedException` (domínio ou NestJS).
    - Decodificar e validar o token com a chave secreta `JWT_SECRET`. Se falhar (expirado ou assinatura inválida), disparar `UnauthorizedException`.
    - **Validação de Fingerprint (Paridade com Go)**:
      1. Extrair o cookie `Fgp` (ou `__Secure-Fgp`) a partir de `request.cookies.Fgp` (assegurar que o parser de cookies está ativo no express).
      2. Obter o IP do request (`request.ip` ou `request.headers['x-forwarded-for']`) e o `User-Agent` (`request.headers['user-agent']`).
      3. Calcular o hash SHA-256 de `IP|UserAgent` usando a biblioteca nativa `crypto` do Node.js: `crypto.createHash('sha256').update(ip + '|' + userAgent).digest('hex')`.
      4. Validar se o cookie extraído (`Fgp`) é exatamente igual ao hash gerado na requisição e se esse mesmo hash confere com a claim `fingerprint` gravada de forma criptografada no payload do JWT.
      5. Se houver qualquer divergência (ataque de sequestro de sessão), disparar `UnauthorizedException`.
    - Se todas as validações passarem, anexar o payload do usuário autenticado decodificado do JWT no `request.user` e retornar `true`.

---

## 🎯 Critérios de Aceitação
1. Rotas decoradas com `@UseGuards(JwtAuthGuard)` devem bloquear requisições sem tokens JWT ou com assinaturas inválidas.
2. O `JwtAuthGuard` deve bloquear a requisição com 401 caso o cookie de fingerprint do navegador esteja ausente ou não bata com o IP/User-Agent gerador original do token.
3. O decorator `@CurrentUser()` deve retornar o objeto do usuário logado dentro dos handlers de controller autenticados.
4. O `ZodValidationPipe` deve interceptar bodies HTTP incorretos e responder com o detalhamento dos campos inválidos no JSON.
