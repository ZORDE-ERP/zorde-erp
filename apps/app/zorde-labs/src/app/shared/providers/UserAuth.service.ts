import { isPlatformBrowser } from '@angular/common';
import { computed, inject, PLATFORM_ID, Service, signal } from '@angular/core';

export type User = {
	id: string;
	email: string;
	nome: string;
	role: string;
};

const USER_KEY = 'user';
const ACCESS_TOKEN_KEY = 'accessToken';

@Service()
export class UserAuthService {
	private readonly platformId = inject(PLATFORM_ID);
	private _user = signal<User | null>(this.restoreUser());
	public readonly currentUser = this._user.asReadonly();
	public isAuthenticated = computed(() => !!this._user()?.id && !!this.getAcessToken());

	public login(user: User, token: string): void {
		this.setUser(user);
		this.setAcessToken(token);
	}

	public setAccessToken(token: string): void {
		this.setAcessToken(token);
	}

	public logout(): void {
		this.clearUser();
		this.removeAcessToken();
	}

	private setUser(user: User): void {
		this._user.set(user);
		if (this.isBrowser()) {
			localStorage.setItem(USER_KEY, JSON.stringify(user));
		}
	}

	public clearUser(): void {
		this._user.set(null);
		if (this.isBrowser()) {
			localStorage.removeItem(USER_KEY);
		}
	}

	public isAdmin(): boolean {
		return this._user()?.role.toLowerCase() === 'admin';
	}

	public isUser(): boolean {
		return this._user()?.role.toLowerCase() === 'user';
	}

	public getUserInfo(): User | null {
		return this.currentUser() || null;
	}

	private setAcessToken(token: string): void {
		if (!token || !this.isBrowser()) return;
		localStorage.setItem(ACCESS_TOKEN_KEY, token);
	}

	public getAcessToken(): string | null {
		if (!this.isBrowser()) return null;
		const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
		return accessToken ? accessToken : null;
	}

	private removeAcessToken(): void {
		if (!this.isBrowser()) return;
		localStorage.removeItem(ACCESS_TOKEN_KEY);
	}

	private restoreUser(): User | null {
		if (!this.isBrowser()) return null;

		const storedUser = localStorage.getItem(USER_KEY);
		if (!storedUser) return null;

		try {
			return JSON.parse(storedUser) as User;
		} catch {
			localStorage.removeItem(USER_KEY);
			return null;
		}
	}

	private isBrowser(): boolean {
		return isPlatformBrowser(this.platformId);
	}
}
