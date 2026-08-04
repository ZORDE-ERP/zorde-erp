import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
	LucideArchive,
	LucideClock,
	LucideDynamicIcon,
	LucideEllipsisVertical,
	LucideFileText,
	LucideFolder,
	LucideHeart,
	LucideHouse,
	LucideLayoutGrid,
	LucideLifeBuoy,
	LucideMinus,
	LucidePalette,
	LucideSettings,
	LucideShare2,
	LucideStore,
	LucideUsers,
	provideLucideIcons,
} from '@lucide/angular';
import { AppAvatarComponent } from '../../data-display/avatar/app-avatar';
import type { AppNavGroup, AppNavItem, AppUserProfile } from '../nav.model';

@Component({
	selector: 'app-sidebar',
	imports: [AppAvatarComponent, LucideDynamicIcon, LucideMinus, LucideEllipsisVertical],
	providers: [
		provideLucideIcons(
			LucideHouse,
			LucideStore,
			LucideLayoutGrid,
			LucideClock,
			LucideFolder,
			LucideHeart,
			LucideShare2,
			LucideArchive,
			LucideFileText,
			LucideUsers,
			LucidePalette,
			LucideLifeBuoy,
			LucideSettings,
		),
	],
	templateUrl: './app-sidebar.html',
})
export class AppSidebarComponent {
	private readonly router = inject(Router);

	public readonly brand = input('Zorde Labs');
	public readonly brandSubtitle = input('Design System');
	public readonly logoSrc = input('/zorde-icon-branco.svg');
	public readonly primaryItems = input<readonly AppNavItem[]>([]);
	public readonly groups = input<readonly AppNavGroup[]>([]);
	public readonly secondaryItems = input<readonly AppNavItem[]>([]);
	public readonly footerItems = input<readonly AppNavItem[]>([]);
	public readonly user = input<AppUserProfile | null>(null);
	public readonly collapsed = input(false);
	public readonly mobileOpen = input(false);

	public readonly collapseToggled = output<void>();
	public readonly navigated = output<void>();
	public readonly profileRequested = output<void>();
	public readonly logoutRequested = output<void>();

	protected readonly userMenuOpen = signal(false);
	protected readonly groupOpen = signal<Record<string, boolean>>({});

	protected async navigateTo(item: AppNavItem): Promise<void> {
		if (item.disabled || !item.path) {
			return;
		}
		await this.router.navigateByUrl(item.path);
		this.onNavigate();
	}

	protected onNavigate(): void {
		this.userMenuOpen.set(false);
		this.navigated.emit();
	}

	protected toggleCollapse(): void {
		this.collapseToggled.emit();
	}

	protected toggleGroup(title: string): void {
		this.groupOpen.update((state) => ({
			...state,
			[title]: !(state[title] ?? true),
		}));
	}

	protected isGroupOpen(title: string): boolean {
		return this.groupOpen()[title] ?? true;
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

	protected isActive(path: string | undefined, exact = false): boolean {
		if (!path) {
			return false;
		}
		const url = this.router.url.split('?')[0] ?? '';
		if (exact) {
			return url === path;
		}
		return url === path || url.startsWith(`${path}/`);
	}

	protected iconName(name: string | undefined): string {
		const map: Record<string, string> = {
			home: 'house',
			store: 'store',
			projects: 'layout-grid',
			scheduled: 'clock',
			folder: 'folder',
			recent: 'clock',
			favorites: 'heart',
			shared: 'share-2',
			archived: 'archive',
			files: 'file-text',
			team: 'users',
			appearance: 'palette',
			support: 'life-buoy',
			settings: 'settings',
		};
		if (!name) {
			return 'house';
		}
		return map[name] ?? name;
	}

	protected trackItem(item: AppNavItem): string {
		return `${item.label}-${item.path ?? ''}`;
	}

	protected itemClasses(item: AppNavItem, exact = false): string {
		if (item.disabled) {
			return 'flex cursor-not-allowed items-center gap-3 rounded-sm-lg px-3 py-2.5 text-sm font-medium text-sidebar-text/40 opacity-50';
		}
		const base =
			'flex items-center gap-3 rounded-sm-lg px-3 py-2.5 text-sm font-medium motion-safe:transition-colors hover:bg-sidebar-hover/20 hover:text-sidebar-text-active';
		const active = this.isActive(item.path, exact) ? 'bg-sidebar-active-bg text-sidebar-text-active' : 'text-sidebar-text';
		return `${base} ${active}`;
	}
}
