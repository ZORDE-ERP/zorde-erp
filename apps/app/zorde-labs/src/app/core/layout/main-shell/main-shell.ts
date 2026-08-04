import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
	type Event,
	NavigationCancel,
	NavigationEnd,
	NavigationError,
	NavigationStart,
	Router,
	RouterOutlet,
} from '@angular/router';
import {
	AppLayoutComponent,
	type AppNavGroup,
	type AppNavItem,
	AppSkeletonComponent,
	AppToastService,
	type AppUserProfile,
} from '@repo/angular-ui';
import { UserAuthService } from '../../../shared/providers/UserAuth.service';

@Component({
	selector: 'app-main-shell',
	imports: [RouterOutlet, AppLayoutComponent, AppSkeletonComponent],
	templateUrl: './main-shell.html',
})
export class MainShell {
	private readonly router = inject(Router);
	private readonly destroyRef = inject(DestroyRef);
	private readonly userAuthService = inject(UserAuthService);
	private readonly toast = inject(AppToastService);

	protected readonly sidebarOpen = signal(false);
	protected readonly sidebarCollapsed = signal(false);
	protected readonly navigating = signal(true);
	protected readonly navbarTitle = signal('Início');
	protected readonly navbarSubtitle = signal('Gestão laboratorial');

	protected readonly primaryItems: readonly AppNavItem[] = [{ label: 'Início', path: '/home', icon: 'home' }];

	protected readonly groups: readonly AppNavGroup[] = [
		{
			title: 'Cadastros',
			items: [
				{ label: 'Serviços', path: '/servicos', icon: 'store' },
				{ label: 'Clientes', path: '/clientes', icon: 'team' },
				{ label: 'Fornecedores', path: '/fornecedores', icon: 'shared' },
				{ label: 'Tabela de Montagem', path: '/tabela-de-servicos', icon: 'files' },
			],
		},
		{
			title: 'Ordens de Serviço',
			items: [{ label: 'Ordens de Serviço', path: '/ordens-de-servico', icon: 'scheduled' }],
		},
		{
			title: 'Impressão',
			items: [{ label: 'Central de Impressão', path: '/impressao-os', icon: 'qr-code' }],
		},
		{
			title: 'Financeiro',
			items: [{ label: 'Faturamento', path: '/faturamento', icon: 'folder', disabled: true }],
		},
	];

	protected readonly user = computed<AppUserProfile>(() => {
		const user = this.userAuthService.getUserInfo();
		return {
			nome: user?.nome ?? 'Usuário',
			email: user?.email ?? '',
			status: 'online',
		};
	});

	public constructor() {
		this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event: Event) => {
			if (event instanceof NavigationStart) {
				this.navigating.set(true);
				return;
			}

			if (event instanceof NavigationEnd) {
				this.updateNavbar();
				this.navigating.set(false);
				return;
			}

			if (event instanceof NavigationCancel || event instanceof NavigationError) {
				this.navigating.set(false);
			}
		});
	}

	protected onSidebarOpenChange(open: boolean): void {
		this.sidebarOpen.set(open);
	}

	protected onSidebarCollapsedChange(collapsed: boolean): void {
		this.sidebarCollapsed.set(collapsed);
	}

	protected onProfile(): void {
		this.toast.show('A área de perfil estará disponível em breve.', 'info');
	}

	protected onLogout(): void {
		this.userAuthService.logout();
		void this.router.navigate(['/login']);
	}

	protected onNotifications(): void {
		this.toast.show('Você não possui novas notificações.', 'info');
	}

	private updateNavbar(): void {
		let route = this.router.routerState.snapshot.root;
		while (route.firstChild) {
			route = route.firstChild;
		}

		const { subtitle, title } = route.data;
		this.navbarTitle.set(title ?? 'Início');
		this.navbarSubtitle.set(subtitle ?? 'Gestão laboratorial');
	}
}
