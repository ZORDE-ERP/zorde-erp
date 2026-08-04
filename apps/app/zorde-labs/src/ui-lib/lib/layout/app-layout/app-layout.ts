import { Component, input, output } from '@angular/core';
import type { AppNavGroup, AppNavItem, AppUserProfile } from '../../navigation/nav.model';
import { AppNavbarComponent } from '../../navigation/navbar/app-navbar';
import { AppSidebarComponent } from '../../navigation/sidebar/app-sidebar';

@Component({
	selector: 'app-layout',
	imports: [AppSidebarComponent, AppNavbarComponent],
	templateUrl: './app-layout.html',
	host: {
		'(document:keydown.escape)': 'onEscape()',
	},
})
export class AppLayoutComponent {
	public readonly brand = input('Zorde Labs');
	public readonly brandSubtitle = input('Design System');
	public readonly navbarTitle = input('Playground');
	public readonly navbarSubtitle = input('Catálogo de componentes');
	public readonly notificationCount = input(0);
	public readonly primaryItems = input<readonly AppNavItem[]>([]);
	public readonly groups = input<readonly AppNavGroup[]>([]);
	public readonly secondaryItems = input<readonly AppNavItem[]>([]);
	public readonly footerItems = input<readonly AppNavItem[]>([]);
	public readonly user = input<AppUserProfile | null>(null);
	public readonly sidebarCollapsed = input(false);
	public readonly sidebarOpen = input(false);

	public readonly sidebarOpenChange = output<boolean>();
	public readonly sidebarCollapsedChange = output<boolean>();
	public readonly profileRequested = output<void>();
	public readonly logoutRequested = output<void>();
	public readonly notificationsClicked = output<void>();

	protected onEscape(): void {
		if (this.sidebarOpen()) {
			this.closeSidebar();
		}
	}

	protected closeSidebar(): void {
		this.sidebarOpenChange.emit(false);
	}

	protected openSidebar(): void {
		this.sidebarOpenChange.emit(true);
	}

	protected toggleSidebar(): void {
		this.sidebarOpenChange.emit(!this.sidebarOpen());
	}

	protected toggleCollapsed(): void {
		this.sidebarCollapsedChange.emit(!this.sidebarCollapsed());
	}

	protected onProfile(): void {
		this.profileRequested.emit();
	}

	protected onLogout(): void {
		this.logoutRequested.emit();
	}

	protected onNotifications(): void {
		this.notificationsClicked.emit();
	}
}
