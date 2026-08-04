import { HttpClient, HttpContext, HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppToastService } from '@repo/angular-ui';
import { catchError, finalize, map, Observable, shareReplay, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserAuthService } from '../shared/providers/UserAuth.service';
import { SKIP_HTTP_ERROR_TOAST } from './response.interceptor';

interface AuthErrorBody {
	readonly error?: string;
}

interface RefreshResponse {
	readonly accessToken: string;
}

let refreshInFlight$: Observable<string> | null = null;

function isAuthRoute(url: string): boolean {
	return url.includes('auth/login') || url.includes('auth/refresh');
}

function getErrorCode(error: HttpErrorResponse): string | undefined {
	const body = error.error as AuthErrorBody | null;
	return body && typeof body === 'object' ? body.error : undefined;
}

export function authRedirectRefreshToken(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
	const http = inject(HttpClient);
	const auth = inject(UserAuthService);
	const router = inject(Router);
	const toast = inject(AppToastService);

	if (isAuthRoute(req.url)) {
		return next(req);
	}

	return next(req).pipe(
		catchError((error: unknown) => {
			if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
				return throwError(() => error);
			}

			if (getErrorCode(error) !== 'TOKEN_EXPIRED') {
				return throwError(() => error);
			}

			if (!refreshInFlight$) {
				refreshInFlight$ = http
					.post<RefreshResponse>(
						`${environment.baseUrl}auth/refresh`,
						{},
						{
							withCredentials: true,
							context: new HttpContext().set(SKIP_HTTP_ERROR_TOAST, true),
						},
					)
					.pipe(
						map((response) => {
							const accessToken = response.accessToken;
							if (!accessToken) {
								throw new Error('Refresh sem accessToken');
							}
							auth.setAccessToken(accessToken);
							return accessToken;
						}),
						catchError((refreshError: unknown) => {
							auth.logout();
							toast.show('Sessão expirada, entre novamente', 'error');
							const returnUrl = router.url?.startsWith('/') ? router.url : '/home';
							void router.navigate(['/login'], { queryParams: { returnUrl } });
							return throwError(() => refreshError);
						}),
						finalize(() => {
							refreshInFlight$ = null;
						}),
						shareReplay({ bufferSize: 1, refCount: false }),
					);
			}

			return refreshInFlight$.pipe(
				switchMap((accessToken) => {
					const retryReq = req.clone({
						setHeaders: { Authorization: `Bearer ${accessToken}` },
					});
					return next(retryReq);
				}),
			);
		}),
	);
}
