import { Routes } from '@angular/router';

export const CADASTRO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./container/cadastro-container.component').then(m => m.CadastroContainerComponent),
  },
];
