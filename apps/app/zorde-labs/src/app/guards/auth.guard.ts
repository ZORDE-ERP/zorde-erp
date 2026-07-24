import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AppToastService } from '@repo/angular-ui';
import { UserAuthService } from '../shared/providers/UserAuth.service';

export const authGuard: CanActivateFn = (route, state) => {
	const userAuth = inject(UserAuthService);
	const router = inject(Router);
	const toastService = inject(AppToastService);
	const isAuthenticated = userAuth.isAuthenticated();
	if (!isAuthenticated) {
		toastService.show('Você precisa estar autenticado para acessar esta página', 'error');
		return router.createUrlTree(['/login'], {
			queryParams: { returnUrl: state.url },
		});
	}
	return true;
};
