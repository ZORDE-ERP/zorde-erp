import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const accessToken = authService.getAccessToken();

  let authReq = req;
  if (accessToken && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
      withCredentials: true,
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        // Here we could attempt to refresh the token, but for simplicity, 
        // let's just clear tokens and redirect to login if we receive a 401.
        // A more robust implementation would check if it's an expired token error
        // and try to call the refresh endpoint.
        
        const refreshToken = authService.getRefreshToken();
        if (refreshToken && !req.url.includes('/auth/refresh')) {
          // Attempt refresh (optional, we could just logout)
          return authService.refresh(refreshToken).pipe(
            switchMap((tokens) => {
              authService.setTokens(tokens);
              const newAuthReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${tokens.access_token}`)
              });
              return next(newAuthReq);
            }),
            catchError((err) => {
              authService.clearTokens();
              router.navigate(['/login']);
              return throwError(() => err);
            })
          );
        }

        authService.clearTokens();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
