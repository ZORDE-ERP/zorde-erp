import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

// Pages
import { Compras } from './pages/compras/compras';
import { Estoque } from './pages/estoque/estoque';
import { Fornecedores } from './pages/fornecedores/fornecedores';
import { Produtos } from './pages/produtos/produtos';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  // Public
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },

  // Protected
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard), canActivate: [AuthGuard] },
  { path: 'pedidos', loadComponent: () => import('./pages/pedidos/pedidos').then(m => m.Pedidos), canActivate: [AuthGuard], data: { permissions: [{ resource: 'pedidos', action: 'read' }] } },
  { path: 'produtos', component: Produtos, canActivate: [AuthGuard] },
  { path: 'compras', component: Compras, canActivate: [AuthGuard] },
  { path: 'estoque', component: Estoque, canActivate: [AuthGuard] },
  { path: 'fornecedores', component: Fornecedores, canActivate: [AuthGuard] },
  { path: 'admin', loadComponent: () => import('./pages/admin/admin').then(m => m.Admin), canActivate: [AuthGuard], data: { permissions: [{ resource: 'config_admin', action: 'manage' }] } },

  // 404
  { path: '**', redirectTo: 'dashboard' },
];

