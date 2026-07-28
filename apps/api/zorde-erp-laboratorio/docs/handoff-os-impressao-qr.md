# Handoff Prompt — Impressão de OS + QR no cadastro do Cliente

> Copie este documento inteiro para o próximo agente. Contexto: backend NestJS em `apps/api/zorde-erp-laboratorio` já tem lançamento de OS via QR (token, itens, fechamento). Este prompt cobre a **próxima camada de produto**: geração automática do token no cadastro, imagem QR, armazenamento, e impressão em lote de folhas de OS.

---

## Feedback arquitetural (decisões recomendadas)

### 1) Quando gerar o token
**Sim: gerar automaticamente no `POST /api/clientes` (criar cliente).**  
Manter `POST /api/clientes/:id/qrcode` só para **regenerar** (invalida QR antigos + exige reimprimir folhas).

Não deixar o frontend chamar “gerar token” como passo obrigatório do formulário — o backend faz isso no create.

### 2) Imagem QR + Cloudinary
**Token no banco é a fonte de verdade. Imagem QR é derivada.**

Recomendação:
- No create (e no regenerate): gerar `qrToken`, montar URL canônica do scan:
  `https://{FRONTEND_APP_URL}/os/scan?c={clienteId}&t={qrToken}`
- Gerar PNG com lib `qrcode` (Node) **no backend**
- Upload Cloudinary (ou similar) → salvar `Cliente.qrCodeUrl` (e opcionalmente `qrCodePublicId` para deletar/substituir no regenerate)
- Frontend da listagem só consome `qrCodeUrl` para preview; impressão usa a mesma URL

**Não** depender só do frontend para gerar o QR na impressão em lote (Puppeteer no server precisa da imagem/URL estável).

Alternativa aceitável: gerar QR on-the-fly na hora do PDF (sem Cloudinary). Cloudinary vale se quiser preview na UI e cache estável.

### 3) “Imprimir N OS” (ex.: 400)
Fluxo de produto correto. Implementar como:
- Frontend: modal “Quantas folhas?” → chama backend `POST /api/clientes/:id/impressao-os` com `{ quantidade: 400 }`
- Backend: gera PDF (Puppeteer ou `pdfkit`/`puppeteer`) com N páginas; cada página = template de OS da ótica + QR fixo do cliente + **código sequencial da folha**
- Resposta: PDF (stream/download) ou URL do PDF no bucket

### 4) Tabela de controle de folhas / ID da OS na folha
**Não usar `MAX(id)+1`** — race condition sob concorrência.

Distinguir dois conceitos:
| Conceito | Quando nasce | Exemplo |
|----------|--------------|---------|
| **Folha impressa (controle)** | No momento do “Imprimir N” | `FolhaOsImpressa` / `LoteImpressaoOs` |
| **Ordem de Serviço lançada** | No scan + seleção de serviços | `OrdemDeServico` atual |

Modelo sugerido:

```prisma
model LoteImpressaoOs {
  id         Int      @id @default(autoincrement())
  clienteId  Int
  usuarioId  Int
  quantidade Int
  createdAt  DateTime @default(now())
  Folhas     FolhaOsImpressa[]
  @@schema("entidades")
}

model FolhaOsImpressa {
  id              Int       @id @default(autoincrement())
  loteId          Int
  clienteId       Int
  usuarioId       Int
  codigoFolha     String    // ex: OS-482-000123 — único por tenant
  status          StatusFolhaOs // IMPRESSA | LANCADA | CANCELADA
  ordemDeServicoId Int?     // preenchido quando o dono lançar via scan
  createdAt       DateTime  @default(now())
  @@unique([usuarioId, codigoFolha])
  @@schema("entidades")
}

enum StatusFolhaOs {
  IMPRESSA
  LANCADA
  CANCELADA
  @@schema("entidades")
}
```

- Sequência: usar `SERIAL`/`autoincrement` da `FolhaOsImpressa.id` **ou** contador por cliente em transação (`SELECT ... FOR UPDATE`), **nunca** `MAX` naive.
- A folha impressa leva `codigoFolha` + QR do **cliente** (token do cliente, como hoje).
- No lançamento (`POST /ordens-de-servico`), opcionalmente aceitar `codigoFolha` / `folhaId` para vincular `FolhaOsImpressa` → `OrdemDeServico` e mudar status `IMPRESSA → LANCADA`.

O QR continua identificando o **cliente** (tabela de preços). O `codigoFolha` identifica a **folha física** no papel (Mercadão dos Óculos / OS-482-000123).

### 5) O que NÃO misturar
- Não criar 400 `OrdemDeServico` “vazias” no imprimir — polui fechamento/faturamento.
- Não colocar o token JWT no QR.
- Regenerar token ⇒ invalidar folhas antigas (documentar; idealmente marcar lotes como obsoletos ou forçar reimpressão).

---

## Estado atual do backend (já feito — NÃO refazer)

App: `apps/api/zorde-erp-laboratorio`  
Prefixo global: `v1` → rotas `v1/api/...`

### Já existe
- Schema: `Cliente.qrToken`, `qrGeradoEm`; `OrdemDeServico` com `valorTotal`, `status`, `origem`; `ItemOrdemDeServico`
- Migration: `prisma/migrations/20260715000000_os_qr_items_and_cliente_qrtoken/`
- `POST /api/clientes/:id/qrcode` → `{ clienteId, token, qrGeradoEm }`
- `GET /api/clientes/:id/tabela-montagem?token=` → 403 se token inválido
- `POST /api/ordens-de-servico` com `itens[]`, origem `QR_SCAN|MANUAL`, totais no server, `$transaction`
- Listagem paginada, `GET .../fechamento`, `PATCH .../faturar`
- Postman: `postman/os-qr-code.postman_collection.json`
- Testes unitários: `src/modules/ordemDeServico/test/ordemDeServicoUnit.spec.ts`

### Padrões do projeto (obrigatório seguir)
- NestJS + Zod + `ZodValidationPipe`
- Clean arch: `application/use-cases`, `domain`, `infrastructure`, `presentation`
- Tenant: sempre filtrar `usuarioId` do JWT (`@User()`)
- Erros: `AppException` (`EntityNotFoundException`, `ForbiddenException`, `BusinessRuleException`, …)
- Paginação estilo `{ items, total }`

---

## Escopo para o próximo agente

### Passo A — Token automático no cadastro
1. Em `CriarClienteUseCase`, após persistir cliente, gerar `qrToken` + `qrGeradoEm` (mesmo `randomBytes(32).toString('hex')`).
2. Incluir no response do cliente se `qrToken` / `qrCodeUrl` devem aparecer na listagem (provavelmente `qrCodeUrl` sim, `qrToken` **não** expor em listagens públicas se houver risco — preferir só URL da imagem e endpoint de regenerate).
3. Manter endpoint de regenerate; ao regenerar: novo token + regenerar imagem Cloudinary + apagar/substituir asset antigo.

### Passo B — QR image + Cloudinary
1. Env: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `FRONTEND_APP_URL` (Zod em `env.validation.ts`).
2. Service `QrCodeImageService`: monta URL scan → `qrcode.toBuffer` → upload Cloudinary → retorna `secure_url` + `public_id`.
3. Prisma: `Cliente.qrCodeUrl String?`, `Cliente.qrCodePublicId String?`.
4. Migration + wire create/regenerate.

### Passo C — Lote de impressão + PDF
1. Models `LoteImpressaoOs` + `FolhaOsImpressa` (+ enum status) como acima.
2. Endpoint autenticado: `POST /api/clientes/:id/impressao-os` body `{ quantidade: number }` (ex.: 1..1000, validar limite).
3. Em transação: criar lote + N folhas com `codigoFolha` sequencial estável.
4. Gerar PDF (Puppeteer recomendado) template HTML:
   - Cabeçalho: nome da ótica (`Cliente.nome` / `nomeFantasia`)
   - QR (imagem `qrCodeUrl`)
   - Campos em branco para a ótica: paciente, serviço solicitado, data solicitação, data entrega
   - `codigoFolha` bem visível
5. Retornar PDF download ou upload Cloudinary do PDF + URL.
6. Frontend (outro agente/UI): botão “Imprimir OS” → modal quantidade → download/print PDF.

### Passo D — Vincular lançamento à folha (opcional neste PR, desejável)
1. Estender `createOrderSchema` com `folhaId` ou `codigoFolha` opcional.
2. Ao criar OS: se informado, marcar folha `LANCADA` e setar `ordemDeServicoId`.
3. Rejeitar se folha já lançada / outro cliente / outro tenant.

### Passo E — Testes
- Create cliente gera token (+ mock Cloudinary)
- Regenerate invalida token antigo e troca `qrCodeUrl`
- Impressão cria N folhas com códigos únicos
- Concorrência: duas impressões não geram `codigoFolha` duplicado
- Create OS com `codigoFolha` vincula corretamente; rejeita reuso

### Fora de escopo deste handoff
- UI Angular completa (tabs ficha cliente, modal imprimir) — só contrato API + PDF
- Receitas oftalmológicas
- Scanner PWA (já especificado no prompt anterior)

---

## Critério de aceite
- [x] Cliente novo já nasce com `qrToken` (+ imagem/URL SVG no Cloudinary)
- [x] Regenerar sobrescreve token e imagem
- [x] `POST .../impressao-os` cria lote + N folhas e devolve PDF utilizável
- [x] Códigos de folha únicos por `usuarioId`, sem `MAX` naive
- [x] OS lançada continua fluindo pelos endpoints atuais; vínculo folha↔OS via `codigoFolha`/`folhaId`
- [x] Migration data-safe; testes passando; padrões Nest/Zod/tenant mantidos

### Postman (testar serviços novos)
Collection: `postman/os-qr-code.postman_collection.json`  
Environment: `postman/zorde-erp-local.postman_environment.json`

Env obrigatória na API: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `FRONTEND_APP_URL`.

Pastas novas:
1. **2. Cliente + QR automático** — `POST /api/clientes` (espera `qrCodeUrl`, sem `qrToken` no body)
2. **3. QR Code do Cliente** — regenerate agora também retorna `qrCodeUrl`
3. **4. Impressão de folhas OS** — `POST /api/clientes/:id/impressao-os` (PDF; use *Send and Download*; captura `X-Codigo-Folha`)
4. **5. OS vinculada à folha** — create com `codigoFolha` + caso 409 de reuso

---

## Ordem sugerida de implementação
1. Migration campos `qrCodeUrl`/`qrCodePublicId` + models lote/folha  
2. QrCodeImageService + Cloudinary  
3. Hook no CriarCliente + regenerate  
4. Endpoint impressão + PDF  
5. Vincular `codigoFolha` no create OS  
6. Testes + Postman novos requests  

---

## Referências rápidas de arquivos
- Schema: `prisma/zordeLabs.prisma`
- Cliente create: `src/modules/cliente/application/use-cases/criarCliente.useCase.ts`
- QR regenerate: `src/modules/cliente/application/use-cases/gerarQrCodeCliente.useCase.ts`
- Create OS: `src/modules/ordemDeServico/application/use-cases/criarOrdem.useCase.ts`
- Env: `src/config/env.validation.ts`
- Handoff anterior (API scan/lançamento): já implementado; collection `postman/os-qr-code.postman_collection.json`
