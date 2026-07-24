import { isPlatformBrowser } from '@angular/common';
import { computed, Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import type { LoginResponse } from '../layout/auth/pages/model/login.model';

const SESSION_KEY = 'zorde-labs:session';

@Injectable({ providedIn: 'root' })
export class AuthSession {
	private readonly platformId = inject(PLATFORM_ID);
	private readonly sessionState = signal<LoginResponse | null>(this.restore());

	public readonly session = this.sessionState.asReadonly();
	public readonly isAuthenticated = computed(() => Boolean(this.sessionState()?.accessToken));
	public readonly user = computed(() => this.sessionState()?.usuario ?? null);

	public set(session: LoginResponse): void {
		this.sessionState.set(session);
		if (isPlatformBrowser(this.platformId)) {
			sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
		}
	}

	public clear(): void {
		this.sessionState.set(null);
		if (isPlatformBrowser(this.platformId)) {
			sessionStorage.removeItem(SESSION_KEY);
		}
	}

	private restore(): LoginResponse | null {
		if (!isPlatformBrowser(this.platformId)) {
			return null;
		}

		const storedSession = sessionStorage.getItem(SESSION_KEY);
		if (!storedSession) {
			return null;
		}

		try {
			return JSON.parse(storedSession) as LoginResponse;
		} catch {
			sessionStorage.removeItem(SESSION_KEY);
			return null;
		}
	}
}
