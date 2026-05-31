# Task 07: Módulo Solicitação Cadastro — Validação OTP & Integração Resend

## 📌 Objetivo
Esta tarefa consiste em implementar o módulo de **Solicitação de Cadastro** (`apps/api/zorde-erp-laboratorio/src/modules/solicitacaoCadastro`), encarregado de validar e-mails de novos usuários através do envio de códigos de uso único (OTP - One-Time Password) de 6 dígitos via e-mail utilizando a plataforma **Resend**:
1. Domínio da entidade `SolicitacaoCadastroEntity`.
2. Criação da porta `ISolicitacaoCadastroRepository` e seu token de injeção.
3. Use cases de orquestração (`SolicitarCadastro`, `VerificarEmail`, `ReenviarCodigo`).
4. Geração segura e aleatória de OTP com `crypto` nativo do Node.js.
5. Integração com o SDK oficial da biblioteca `resend` e template HTML premium para envio de e-mails.
6. Controllers públicos mapeados na API.

---

## 🛠️ MCP (`context7`) — Como Obter Ajuda de Documentação
Se precisar de detalhes sobre a integração da biblioteca do **Resend** no Node.js ou gerenciamento de data e expiração (JavaScript Date API):
- Utilize a ferramenta de busca/MCP do `context7` para obter a documentação atual de **Resend** (Node SDK usage, HTML sending templates) e **Zod**.

---

## 📂 Diretórios & Arquivos Alvo
- `apps/api/zorde-erp-laboratorio/src/modules/solicitacaoCadastro/domain/entities/solicitacao-cadastro.entity.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/solicitacaoCadastro/domain/repositories/i-solicitacao-cadastro.repository.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/solicitacaoCadastro/application/dtos/`
  - `solicitar-cadastro.dto.ts`
  - `verificar-email.dto.ts`
  - `reenviar-codigo.dto.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/solicitacaoCadastro/application/use-cases/`
  - `solicitar-cadastro.use-case.ts`
  - `verificar-email.use-case.ts`
  - `reenviar-codigo.use-case.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/solicitacaoCadastro/infrastructure/services/resend-email.service.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/solicitacaoCadastro/infrastructure/repositories/prisma-solicitacao-cadastro.repository.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/solicitacaoCadastro/presentation/controllers/solicitacao-cadastro.controller.ts`
- `apps/api/zorde-erp-laboratorio/src/modules/solicitacaoCadastro/solicitacao-cadastro.module.ts`

---

## 📋 Checklist de Execução

### 1. Domínio da Solicitação de Cadastro
- [ ] Crie `src/modules/solicitacaoCadastro/domain/entities/solicitacao-cadastro.entity.ts`:
  - Classe `SolicitacaoCadastroEntity`: `id` (number), `email` (string), `codigo` (string de 6 chars), `expiracao` (Date), `criadoEm` (Date).
- [ ] Crie `src/modules/solicitacaoCadastro/domain/repositories/i-solicitacao-cadastro.repository.ts`:
  - Interface `ISolicitacaoCadastroRepository` com:
    - `criar(solicitacao: SolicitacaoCadastroEntity): Promise<SolicitacaoCadastroEntity>`
    - `buscarPorEmail(email: string): Promise<SolicitacaoCadastroEntity | null>`
    - `deletarPorEmail(email: string): Promise<void>`
  - Token DI: `export const I_SOLICITACAO_CADASTRO_REPOSITORY = 'ISolicitacaoCadastroRepository';`

### 2. Serviço de Envio de E-mail (`ResendEmailService`)
- [ ] Crie `src/modules/solicitacaoCadastro/infrastructure/services/resend-email.service.ts`:
  - Instanciar a biblioteca `resend` via `const resend = new Resend(process.env.RESEND_API_KEY)`.
  - Método `enviarCodigoOtp(email: string, codigo: string): Promise<void>`.
  - Construir um template HTML moderno de e-mail com design premium (vibrant colors, centralizado, botão de destaque e fontes agradáveis) convidando o usuário a copiar o OTP de 6 dígitos.

### 3. DTOs (Zod)
- [ ] Crie os DTOs com validação Zod:
  - `SolicitarCadastroDto`: `email` (string, email format).
  - `VerificarEmailDto`: `email` (string, email format), `codigo` (string de tamanho exatamente 6).
  - `ReenviarCodigoDto`: `email` (string, email format).

### 4. Use Cases de Verificação
Implemente os use cases injetáveis:
- [ ] **`solicitar-cadastro.use-case.ts`**:
  - Injetar `IUsuarioRepository` (para verificar se e-mail já existe, lançando `ConflictException` 409 caso positivo).
  - Injetar `ISolicitacaoCadastroRepository` e `ResendEmailService`.
  - Remover qualquer solicitação pendente existente para o e-mail solicitado para evitar concorrência ou lixo na tabela.
  - Gerar código OTP de 6 dígitos seguro utilizando o módulo nativo `crypto` do Node:
    `crypto.randomInt(100000, 999999).toString()`
  - Definir data de expiração para exatamente **5 minutos** a partir do momento atual.
  - Persistir a nova entidade `SolicitacaoCadastroEntity` no banco de dados.
  - Disparar o e-mail via `ResendEmailService.enviarCodigoOtp` de forma assíncrona.
- [ ] **`verificar-email.use-case.ts`**:
  - Buscar a solicitação pendente por e-mail no banco. Se não existir, disparar erro 404/400 (Código inválido).
  - Verificar se a solicitação expirou (`new Date() > solicitacao.expiracao`). Em caso positivo, disparar `BusinessRuleException` (Código expirado).
  - Validar se o código enviado pelo usuário confere exatamente com o do banco. Se inválido, disparar erro de validação.
  - Removido o OTP bem-sucedido via `deletarPorEmail(email)` para garantir uso único. Retornar mensagem de sucesso.
- [ ] **`reenviar-codigo.use-case.ts`**:
  - Validar o tempo mínimo (cooldown) de reenvio de **30 segundos** analisando o campo `criadoEm` da solicitação existente no banco de dados. Se estiver dentro do limite de tempo, lançar `BusinessRuleException` (Aguarde 30 segundos).
  - Regenerar o OTP, atualizar no banco a expiração/código e reenviar o e-mail.

### 5. Repositório Prisma & Controller
- [ ] Crie a implementação `PrismaSolicitacaoCadastroRepository` estritamente mapeando os campos do model `SolicitacaoCadastro` para o banco.
- [ ] Crie `src/modules/solicitacaoCadastro/presentation/controllers/solicitacao-cadastro.controller.ts`:
  - `@Controller('api/auth')`. Injetar use cases correspondentes.
  - **`POST /solicitar-cadastro` (Público)**: Rota pública para pedir início de validação.
  - **`POST /verificar-email` (Público)**: Rota pública de validação que responde com sucesso se código confere.
  - **`POST /reenviar-codigo` (Público)**: Rota de reenvio de OTP respeitando a regra de cooldown de 30s.

### 6. Configuração do Módulo NestJS
- [ ] Crie `src/modules/solicitacaoCadastro/solicitacao-cadastro.module.ts`:
  - Declarar as injeções e exports dos serviços. Registrar o módulo no `AppModule` principal.

---

## 🎯 Critérios de Aceitação
1. A geração do OTP deve ser baseada em algoritmos criptográficos seguros nativos (`crypto`), nunca em geradores lineares simples.
2. O reenvio de e-mail deve falhar com status HTTP 400 se acionado antes de 30 segundos contados a partir da criação da solicitação ativa.
3. Se um código OTP correto de 6 dígitos for validado, o registro correspondente da tabela `solicitacao_cadastro` deve ser excluído do banco imediatamente.
