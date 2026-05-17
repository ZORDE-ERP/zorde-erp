import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent),
  },
  {
    path: 'cadastro',
    loadChildren: () =>
      import('./features/cadastro/cadastro.routes').then(m => m.CADASTRO_ROUTES),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: 'clientes',
        loadChildren: () =>
          import('./features/clientes/clients.module').then(m => m.ClientsModule),
      },
      {
        path: 'fornecedores',
        loadChildren: () =>
          import('./features/fornecedores/suppliers.module').then(m => m.SuppliersModule),
      },
      {
        path: 'ordens-de-servico',
        loadChildren: () =>
          import('./features/ordens-de-servico/service-orders.module').then(
            m => m.ServiceOrdersModule,
          ),
      },
      {
        path: 'tabela-montagem',
        loadComponent: () =>
          import('./features/tabela-montagem/container/tabela-montagem-page.component').then(
            m => m.TabelaMontagemPageComponent,
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
