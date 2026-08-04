export interface AppNavItem {
	readonly label: string;
	readonly path?: string;
	readonly icon?: string;
	readonly count?: number;
	readonly active?: boolean;
	readonly disabled?: boolean;
}

export interface AppNavGroup {
	readonly title: string;
	readonly collapsible?: boolean;
	readonly items: readonly AppNavItem[];
}

export interface AppUserProfile {
	readonly nome: string;
	readonly email: string;
	readonly avatarSrc?: string;
	readonly status?: 'online' | 'offline';
}
