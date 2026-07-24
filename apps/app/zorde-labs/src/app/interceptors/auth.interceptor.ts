import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserAuthService } from '../shared/providers/UserAuth.service';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
	const authToken = inject(UserAuthService).getAcessToken();
	if (!authToken) {
		return next(req);
	}
	const newReq = req.clone({
		headers: req.headers.append('Authorization', `Bearer ${authToken}`),
	});
	return next(newReq);
}
