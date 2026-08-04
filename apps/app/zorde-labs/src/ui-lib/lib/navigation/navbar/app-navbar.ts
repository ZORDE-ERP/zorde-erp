import { Component, input, output, signal } from '@angular/core';
import { LucideBell, LucideMenu } from '@lucide/angular';
import { AppAvatarComponent } from '../../data-display/avatar/app-avatar';
import type { AppUserProfile } from '../nav.model';

@Component({
	selector: 'app-navbar',
	imports: [AppAvatarComponent, LucideBell, LucideMenu],
	templateUrl: './app-navbar.html',
})
export class AppNavbarComponent {
	public readonly title = input('Playground');
	public readonly subtitle = input('Catálogo de componentes');
	public readonly notificationCount = input(0);
	public readonly user = input<AppUserProfile | null>(null);

	public readonly menuToggled = output<void>();
	public readonly notificationsClicked = output<void>();
	public readonly profileRequested = output<void>();
	public readonly logoutRequested = output<void>();

	protected readonly userMenuOpen = signal(false);

	protected toggleMenu(): void {
		this.menuToggled.emit();
	}

	protected onNotifications(): void {
		this.notificationsClicked.emit();
	}

	protected toggleUserMenu(): void {
		this.userMenuOpen.update((open) => !open);
	}

	protected onProfile(): void {
		this.userMenuOpen.set(false);
		this.profileRequested.emit();
	}

	protected onLogout(): void {
		this.userMenuOpen.set(false);
		this.logoutRequested.emit();
	}
}
