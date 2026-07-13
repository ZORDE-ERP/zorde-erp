# 🎨 Zorde ERP - Angular Frontend (COMPLETO)

## ✅ O Que Foi Implementado

### Autenticação & Segurança
- ✅ **Auth Service**: Login, logout, armazenar JWT
- ✅ **HTTP Interceptor**: Adiciona Authorization header automaticamente
- ✅ **Auth Guard**: Protege rotas
- ✅ **LocalStorage**: Persiste token e user info

### Serviços HTTP
- ✅ **AuthService**: Gerencia login/logout/token
- ✅ **PedidosService**: CRUD de pedidos + atualizar stage
- ✅ **ProdutosService**: CRUD de produtos
- ✅ **FornecedoresService**: CRUD de fornecedores
- ✅ **AdminService**: Gerenciar roles, permissions, pipeline stages

### Páginas (Componentes)
- ✅ **Login**: Formulário com validação
- ✅ **Dashboard**: Resumo de pedidos + ações rápidas
- ✅ **Pedidos**: CRUD completo + modal para atualizar stage
- ✅ **Admin**: Gerenciar pipeline stages e roles

### Features
- ✅ Layout responsivo
- ✅ Validação de formulários (Reactive Forms)
- ✅ Modais para criar/editar
- ✅ Controle de permissões no frontend (exibir/esconder botões)
- ✅ Tratamento de erros
- ✅ Loading states

---

## 🚀 Como Rodar

### 1. Backend (já pronto)
```bash
cd apps/api/zorde-erp-empresas
npm run start:dev
# API rodando em http://localhost:3001/api/v1
```

### 2. Frontend
```bash
cd apps/app/zorde-erp-empresas
npm start
# Angular em http://localhost:4200
```

### 3. Fazer Login
```
Email: admin@lab.com
Senha: admin123
```

---

## 📁 Estrutura de Arquivos

```
src/app/
├── services/
│   ├── auth.service.ts                # Login, JWT, user info
│   ├── pedidos.service.ts             # CRUD de pedidos
│   ├── produtos.service.ts            # CRUD de produtos
│   ├── fornecedores.service.ts        # CRUD de fornecedores
│   └── admin.service.ts               # Admin APIs
│
├── guards/
│   └── auth.guard.ts                  # Protege rotas
│
├── interceptors/
│   └── auth.interceptor.ts            # Adiciona Authorization header
│
├── pages/
│   ├── login/login.ts                 # Tela de login
│   ├── dashboard/dashboard.ts         # Dashboard
│   ├── pedidos/pedidos.ts             # CRUD de pedidos
│   ├── admin/admin.ts                 # Admin panel
│   ├── produtos/produtos.ts           # (Já existia)
│   ├── fornecedores/fornecedores.ts   # (Já existia)
│   ├── estoque/estoque.ts             # (Já existia)
│   └── compras/compras.ts             # (Já existia)
│
├── app.routes.ts                      # Rotas com guards e permissões
└── app.config.ts                      # Configuração global + Interceptor
```

---

## 🔑 Como Usar as Permissões

### No Frontend
```typescript
// Componente recebe user com permissions
currentUser$ = this.authService.currentUser$;

// Template: mostrar botão só se tem permissão
<button *ngIf="isAdmin">Deletar</button>

// TS: verificar permissão
if (this.authService.hasPermission('pedidos', 'update_stage')) {
  // Pode atualizar stage
}
```

### Guards Automáticos
```typescript
// Rota protegida com permissão obrigatória
{
  path: 'admin',
  component: Admin,
  canActivate: [AuthGuard],
  data: { permissions: [{ resource: 'config_admin', action: 'manage' }] }
}
```

---

## 📋 Fluxo Completo: Criar um Pedido

### 1. Usuário faz login
```
Login Page → AuthService.login() → JWT salvo em localStorage
```

### 2. Dashboard carrega
```
Dashboard → PedidosService.listar() → com JWT no header
```

### 3. Clicar "Novo Pedido"
```
Modal abre → Formulário com produtoId e clienteId
```

### 4. Salvar
```
PedidosService.criar(data) → POST /api/v1/pedidos → Pedido criado
```

### 5. Atualizar Status
```
Clicar botão "📊" → Modal de stages → 
PedidosService.atualizarStage() → PATCH /api/v1/pedidos/:id/stage
```

---

## 🎨 Customizar Estilo

Todos os componentes têm `styles: [...]` inline. Para mudar:

```typescript
// Exemplo: mudar cor principal
// Em qualquer componente, alterar:
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// Para sua cor favorita, ex:
background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
```

---

## 🔗 Integração com Novas Páginas

### Criar uma página de Estoque (exemplo)
```typescript
// 1. Criar EstoqueService
// apps/app/zorde-erp-empresas/src/app/services/estoque.service.ts

// 2. Criar componente
// apps/app/zorde-erp-empresas/src/app/pages/estoque/estoque-novo.ts

import { Component, inject } from '@angular/core';
import { EstoqueService } from '../../services/estoque.service';

@Component({
  selector: 'app-estoque-novo',
  standalone: true,
  template: `...`
})
export class EstoqueNovo {
  private estoqueService = inject(EstoqueService);
}

// 3. Adicionar rota
export const routes: Routes = [
  { path: 'estoque', component: EstoqueNovo, canActivate: [AuthGuard] }
];
```

---

## 🧪 Testar a Integração

### Via Browser DevTools (F12)
```javascript
// Verificar token
localStorage.getItem('token')

// Verificar user
JSON.parse(localStorage.getItem('user'))

// Ver requests (Network tab)
// Todos devem ter header: Authorization: Bearer TOKEN
```

### Via cURL (testar sem frontend)
```bash
# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lab.com","senha":"admin123"}'

# Pegar token da resposta, depois:
curl -X GET http://localhost:3001/api/v1/pedidos \
  -H "Authorization: Bearer TOKEN"
```

---

## 🚨 Troubleshooting

| Problema | Solução |
|----------|---------|
| **Login não funciona** | Verificar se backend está rodando em :3001 |
| **Pedidos não carregam** | Abrir DevTools → Network → ver erro na request |
| **"401 Unauthorized"** | Token expirou, fazer login novamente |
| **CORS error** | Backend CORS configurado para localhost:4200 |
| **Formulário não submete** | Verificar se todos os campos required estão preenchidos |
| **Botões desabilitados** | Usuário não tem permissão (checar role/permissions) |

---

## 🎯 Próximas Melhorias

1. **WebSocket em Tempo Real**
   - Substituir polling por WebSocket para mudanças de status
   - Usar `ngx-socket-io` ou nativo

2. **Toast Notifications**
   - Mostrar sucesso/erro ao criar/atualizar
   - Usar `@angular/cdk` ou lib externa

3. **Paginação**
   - Pedidos, produtos, fornecedores com paginate
   - Implementar skip/take na API

4. **Filtros**
   - Filtrar pedidos por status, data, cliente
   - Usar Query Params na URL

5. **Gráficos**
   - Dashboard com Chart.js/ngx-charts
   - Mostrar distribuição por pipeline stage

6. **Temas Escuro/Claro**
   - Usar CSS variables
   - Armazenar preferência em localStorage

7. **i18n (Multi-idioma)**
   - `@angular/localize`
   - Suportar PT-BR, EN-US, etc

---

## 📚 Referências

- **Angular**: https://angular.dev
- **Standalone Components**: https://angular.io/guide/standalone-components
- **Reactive Forms**: https://angular.io/guide/reactive-forms
- **HTTP Client**: https://angular.io/guide/http
- **Routing & Guards**: https://angular.io/guide/router

---

## ✨ Checklist para Produção

- [ ] Mudar URL hardcoded da API para variável de ambiente
- [ ] Adicionar .env.example com URLs
- [ ] Implementar refresh token (não expira tão rápido)
- [ ] Adicionar erro handling completo
- [ ] Fazer testes E2E com Cypress/Playwright
- [ ] Optimizar bundle size (lazy loading, tree-shaking)
- [ ] Adicionar PWA (funciona offline)
- [ ] Deploy em produção (Vercel, Netlify, etc)

---

**Frontend Status:** ✅ **100% Funcional**
**Data:** 2026-07-13
**Versão:** 1.0.0
