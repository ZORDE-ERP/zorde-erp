import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
	{
		path: 'login',
		loadComponent: () => import('./core/layout/auth/pages/login').then((m) => m.LoginComponent),
	},
	{
		path: 'playground',
		loadComponent: () => import('./core/layout/app-shell/app-shell').then((module) => module.AppShell),
		loadChildren: () =>
			import('./features/design-system/design-system.routes').then((module) => module.DESIGN_SYSTEM_ROUTES),
	},
	{
		path: '',
		canActivate: [authGuard],
		loadComponent: () => import('./core/layout/main-shell/main-shell').then((module) => module.MainShell),
		loadChildren: () => import('./features/application/application.routes').then((module) => module.APPLICATION_ROUTES),
	},
	{
		path: '**',
		redirectTo: 'home',
	},
];
