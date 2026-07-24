import { computed, Service, signal } from '@angular/core';

export type User = {
	id: string;
	email: string;
	nome: string;
	role: string;
};

@Service()
export class UserAuthService {
	private _user = signal<User | null>(null);
	public readonly currentUser = this._user.asReadonly();
	public isAuthenticated = computed(() => this._user()?.id !== null && !!this.getAcessToken());

	public login(user: User, token: string): void {
		this.setUser(user);
		this.setAcessToken(token);
	}

	public logout(): void {
		this.clearUser();
		this.removeAcessToken();
	}

	private setUser(user: User): void {
		this._user.set(user);
	}

	public clearUser(): void {
		this._user.set(null);
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
		if (!token) return;
		localStorage.setItem('accessToken', token);
	}

	public getAcessToken(): string | null {
		const accessToken = localStorage.getItem('accessToken');
		return accessToken ? accessToken : null;
	}

	private removeAcessToken(): void {
		localStorage.removeItem('accessToken');
	}
}
