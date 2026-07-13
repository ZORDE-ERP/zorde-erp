# 🚀 Zorde ERP - Backend Setup & Frontend Integration

## Status: Backend Completo ✅

O backend foi refatorado com sucesso para suportar:
- ✅ Multitenancy (Organizações)
- ✅ Autenticação JWT com Passport
- ✅ RBAC granular (Roles + Permissions dinâmicas)
- ✅ Pipeline de produção customizável
- ✅ Histórico completo de mudanças
- ✅ Admin module para gerenciar permissões
- ✅ Tratamento de erros global
- ✅ EventEmitter preparado para WebSocket

---

## 🔧 Setup Local (Banco de Dados)

### 1. Iniciar PostgreSQL
```bash
docker compose -f docker-compose.postgres.yaml up -d
```

### 2. Criar as Tabelas
```bash
cd apps/api/zorde-erp-empresas
npx prisma migrate deploy
```

### 3. Popular com Dados de Teste
```bash
npx prisma db push  # Sincroniza schema
node dist/prisma/seed.js  # Roda o seed (após compilar)
```

**Ou manualmente via SQL:**
```sql
-- Criar admin user
INSERT INTO "User" (id, email, senha, nome, "organizationId", "roleId", "createdAt", "updatedAt")
VALUES ('abc123', 'admin@lab.com', HASHED_PASSWORD, 'Admin Lab', 'org123', 'role123', NOW(), NOW());
```

---

## 📝 Credenciais de Teste

| Email | Senha | Role |
|-------|-------|------|
| admin@lab.com | admin123 | ADMIN (acesso total) |
| operador@lab.com | operator123 | OPERATOR (pedidos, estoque, compras) |

---

## 🔐 Autenticação

### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lab.com",
    "senha": "admin123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "abc123",
    "email": "admin@lab.com",
    "nome": "Admin Lab",
    "role": "ADMIN",
    "permissions": [
      { "resource": "pedidos", "action": "read" },
      { "resource": "pedidos", "action": "update_stage" },
      ...
    ]
  }
}
```

### Usar o Token
```bash
curl -X GET http://localhost:3001/api/v1/pedidos \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📚 Endpoints Principais

### **Auth (Público)**
```
POST   /api/v1/auth/login                    Login com JWT
GET    /api/v1/health                        Health check
```

### **Pedidos** (com autenticação)
```
GET    /api/v1/pedidos                       Listar pedidos (filtrado por org do usuário)
POST   /api/v1/pedidos                       Criar pedido
GET    /api/v1/pedidos/:id                   Detalhes do pedido
PATCH  /api/v1/pedidos/:id                   Atualizar pedido
PATCH  /api/v1/pedidos/:id/stage             Atualizar status/etapa (requer permissão pedidos:update_stage)
DELETE /api/v1/pedidos/:id                   Deletar pedido
```

### **Produtos**
```
GET    /api/v1/produtos                      Listar
POST   /api/v1/produtos                      Criar
GET    /api/v1/produtos/:id                  Detalhes
PATCH  /api/v1/produtos/:id                  Atualizar
DELETE /api/v1/produtos/:id                  Deletar
```

### **Estoque**
```
GET    /api/v1/estoque                       Listar
PATCH  /api/v1/estoque/:id                   Atualizar quantidade
```

### **Fornecedores**
```
GET    /api/v1/fornecedores                  Listar
POST   /api/v1/fornecedores                  Criar
PATCH  /api/v1/fornecedores/:id              Atualizar
DELETE /api/v1/fornecedores/:id              Deletar
```

### **Admin** (requer permissão config_admin:manage)
```
GET    /api/v1/admin/roles                   Listar roles
POST   /api/v1/admin/roles                   Criar role
POST   /api/v1/admin/roles/:roleId/permissions/:permissionId
DELETE /api/v1/admin/roles/:roleId/permissions/:permissionId

GET    /api/v1/admin/pipeline-stages         Listar etapas do pipeline
POST   /api/v1/admin/pipeline-stages         Criar etapa
PATCH  /api/v1/admin/pipeline-stages/:id     Atualizar ordem/nome
DELETE /api/v1/admin/pipeline-stages/:id     Deletar etapa
```

---

## 🎯 Pipeline Padrão

O backend vem com 7 etapas de pipeline criadas por padrão:

1. **PEDIDO_RECEBIDO** - Pedido registrado no sistema
2. **LENTE_PEDIDA** - Lente solicitada ao fornecedor
3. **LENTE_RECEBIDA** - Lente chegou no laboratório
4. **EM_MONTAGEM** - Lente sendo montada com o óculos
5. **TESTES_QUALIDADE** - Em testes de qualidade
6. **PRONTO_ENVIO** - Pronto para enviar (terminal)
7. **ENTREGUE** - Entregue ao cliente (terminal)

**Customizar:**
```bash
# Listar stages da organização
curl -X GET http://localhost:3001/api/v1/admin/pipeline-stages \
  -H "Authorization: Bearer TOKEN"

# Criar novo stage
curl -X POST http://localhost:3001/api/v1/admin/pipeline-stages \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MEU_STAGE_CUSTOMIZADO",
    "order": 4,
    "isTerminal": false
  }'
```

---

## 🔄 Fluxo de Atualização de Pedido

```mermaid
1. Cliente compra na Ótica
   ↓
2. POST /pedidos (cria pedido em PEDIDO_RECEBIDO)
   ↓
3. PATCH /pedidos/:id/stage { stageId: "lente_pedida_id" }
   ↓
4. Evento emitido (PedidoStatusChangedEvent)
   ↓
5. Histórico registrado (OrderStatusHistory)
   ↓
6. Todos veem o novo status (pronto para WebSocket)
```

---

## 🎨 Próximo Passo: Frontend (Angular)

O frontend precisa:

1. **Integração HTTP**
   - Usar `HttpClient` para chamar a API
   - Interceptar Authorization header com o JWT token

2. **Telas Principais**
   ```
   Login
     ↓
   Dashboard (resumo pedidos + pipeline)
     ↓
   Pedidos (CRUD + atualizar status)
   Produtos (CRUD)
   Estoque (visualizar quantidade)
   Fornecedores (CRUD)
   Admin (gerenciar roles, permissões, stages)
   ```

3. **Armazenamento de Dados**
   - LocalStorage: JWT token + user info
   - Estado (NgRx/Signal): pedidos, produtos, organizationId

4. **Permissões no Frontend**
   - Mostrar/esconder botões baseado em `user.permissions`
   - Validar antes de fazer requisições

### Exemplo: Login + Armazenar Token
```typescript
// auth.service.ts
login(email: string, senha: string) {
  return this.http.post<LoginResponse>('/api/v1/auth/login', {
    email,
    senha
  }).pipe(
    tap(response => {
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      // Emitir para o app que o usuário fez login
    })
  );
}

// http.interceptor.ts
intercept(req, next) {
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next.handle(req);
}
```

---

## 🧪 Testar a API Rapidamente

### Opção 1: Postman/Insomnia
- Importar collection com os endpoints acima
- Usar Bearer token

### Opção 2: cURL
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lab.com","senha":"admin123"}' | jq -r '.access_token')

# 2. Listar pedidos
curl -X GET http://localhost:3001/api/v1/pedidos \
  -H "Authorization: Bearer $TOKEN"

# 3. Criar pedido
curl -X POST http://localhost:3001/api/v1/pedidos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "cliente123",
    "produtoId": "produto123",
    "currentStageId": "stage_pedido_recebido_id"
  }'
```

### Opção 3: GraphQL (futuro)
```
POST /api/v1/graphql
```

---

## 🔒 Segurança

- ✅ Senhas hasheadas com Argon2
- ✅ JWT com secret em variável de ambiente
- ✅ CORS restrito ao localhost:4200 (frontend)
- ✅ Guards JWT + Permission em rotas protegidas
- ✅ Validação de Zod (DTOs)
- ✅ Multitenancy: usuário só vê dados da sua org

**Melhorias Futuras:**
- Rate limiting
- API Keys para equipamentos
- Audit log de todas as ações
- Refresh tokens

---

## 📊 Schema de Dados

```
Organization
├── Users (com Role)
├── Roles (com Permissions)
├── PipelineStages (customizáveis)
├── Produtos
├── Estoque
├── Clientes
├── Fornecedores
├── Compras
└── Pedidos
    └── OrderStatusHistory (auditoria)
```

---

## 🚀 Fazer Rodando em Produção

```bash
# Build
npm run build

# Rodar a API
node dist/main.js

# Ou com PM2
pm2 start dist/main.js --name "zorde-api"
```

**Variáveis de Ambiente Necessárias:**
```
DATABASE_URL=postgresql://...
API_PORT=3001
APP_ENV=production
JWT_SECRET=sua_chave_super_secreta_aqui
JWT_EXPIRES_IN=24h
```

---

## 📞 Suporte

- Erro: `Permission denied`? → Verifique se o role do usuário tem a permissão necessária
- Erro: `Token expired`? → Faça login novamente para pegar novo token
- Erro: `Organization not found`? → Verifique se o usuário pertence à organização
- Erro: `Database connection`? → Verifique se PostgreSQL está rodando e DATABASE_URL está correto

---

## ✅ Checklist para Frontend

- [ ] Implementar login com JWT
- [ ] Armazenar token em localStorage
- [ ] Adicionar Authorization header no HttpClient
- [ ] Criar dashboard com resumo de pedidos
- [ ] Criar tela de CRUD de pedidos
- [ ] Mostrar pipeline com etapas
- [ ] Adicionar permissões nas telas (role-based UI)
- [ ] Integrar com admin module para gerenciar roles
- [ ] Conectar com WebSocket quando estiver pronto

---

**Criado:** 2026-07-13
**Versão API:** v1
**Status:** ✅ Pronto para Frontend
