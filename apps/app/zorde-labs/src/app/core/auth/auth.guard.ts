import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AuthSession } from './auth-session';

export const authGuard: CanActivateFn = () => {
	const session = inject(AuthSession);
	const router = inject(Router);

	return session.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
