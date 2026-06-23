import { Routes } from '@angular/router';
import { Compras } from './pages/compras/compras';
import { Estoque } from './pages/estoque/estoque';
import { Fornecedores } from './pages/fornecedores/fornecedores';
import { Produtos } from './pages/produtos/produtos';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'produtos' },
  { path: 'produtos', component: Produtos },
  { path: 'compras', component: Compras },
  { path: 'estoque', component: Estoque },
  { path: 'fornecedores', component: Fornecedores },
];
