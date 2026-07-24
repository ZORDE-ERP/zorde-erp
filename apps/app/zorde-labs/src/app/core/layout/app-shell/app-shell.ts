import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppLayoutComponent, AppNavGroup, AppNavItem, AppToastService, AppUserProfile } from '@repo/angular-ui';

@Component({
	selector: 'app-app-shell',
	imports: [RouterOutlet, AppLayoutComponent],
	templateUrl: './app-shell.html',
	styleUrl: './app-shell.css',
})
export class AppShell {
	private readonly toast = inject(AppToastService);

	protected readonly sidebarOpen = signal(false);
	protected readonly sidebarCollapsed = signal(false);

	protected readonly primaryItems: readonly AppNavItem[] = [
		{ label: 'Visão geral', path: '/playground', icon: 'home' },
		{ label: 'Componentes', path: '/playground/components/buttons', icon: 'projects' },
		{ label: 'Formulários', path: '/playground/components/forms', icon: 'files' },
	];

	protected readonly groups: readonly AppNavGroup[] = [
		{
			title: 'Foundations',
			items: [
				{ label: 'Cores', path: '/playground/foundations/colors', icon: 'appearance', count: 5 },
				{ label: 'Tipografia', path: '/playground/foundations/typography', icon: 'files' },
				{ label: 'Espaçamento', path: '/playground/foundations/spacing', icon: 'folder' },
				{ label: 'Bordas', path: '/playground/foundations/borders', icon: 'folder' },
				{ label: 'Sombras', path: '/playground/foundations/shadows', icon: 'folder' },
			],
		},
		{
			title: 'Catálogo',
			items: [
				{ label: 'Botões', path: '/playground/components/buttons', icon: 'projects' },
				{ label: 'Links', path: '/playground/components/links', icon: 'shared' },
				{ label: 'Cards', path: '/playground/components/cards', icon: 'files' },
				{ label: 'Dropdowns', path: '/playground/components/dropdowns', icon: 'folder' },
				{ label: 'Feedback', path: '/playground/components/feedback', icon: 'settings' },
				{ label: 'Overlays', path: '/playground/components/overlays', icon: 'folder' },
				{ label: 'Tabs', path: '/playground/components/tabs', icon: 'folder' },
				{ label: 'Searchable Select', path: '/playground/components/searchable-select', icon: 'folder' },
			],
		},
	];

	protected readonly footerItems: readonly AppNavItem[] = [
		{ label: 'Suporte', path: '/playground', icon: 'support' },
		{ label: 'Configurações', path: '/playground', icon: 'settings' },
	];

	protected readonly user: AppUserProfile = {
		nome: 'Usuário Demo',
		email: 'demo@zorde.com.br',
		status: 'online',
	};

	protected onSidebarOpenChange(open: boolean): void {
		this.sidebarOpen.set(open);
	}

	protected onSidebarCollapsedChange(collapsed: boolean): void {
		this.sidebarCollapsed.set(collapsed);
	}

	protected onProfile(): void {
		this.toast.show('Ação Perfil (demo visual)', 'info');
	}

	protected onLogout(): void {
		this.toast.show('Ação Sair (demo visual)', 'warning');
	}

	protected onNotifications(): void {
		this.toast.show('Notificações (demo visual)', 'info');
	}
}
