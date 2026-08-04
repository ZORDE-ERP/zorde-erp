import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { authRedirectRefreshToken } from './interceptors/refreshTokenRedirect.interceptor';
import { httpErrorInterceptor } from './interceptors/response.interceptor';

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideRouter(routes),
		...(environment.useHydration ? [provideClientHydration(withEventReplay())] : []),
		provideHttpClient(withInterceptors([authInterceptor, authRedirectRefreshToken, httpErrorInterceptor])),
	],
};
