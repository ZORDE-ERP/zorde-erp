import {
	HttpContextToken,
	HttpErrorResponse,
	HttpEvent,
	HttpHandlerFn,
	HttpInterceptorFn,
	HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AppToastService } from '@repo/angular-ui';
import { catchError, Observable, throwError } from 'rxjs';

interface ApiErrorResponse {
	readonly message?: unknown;
	readonly error?: unknown;
}

const genericBackendMessages = new Set([
	'bad request',
	'unauthorized',
	'forbidden',
	'not found',
	'request timeout',
	'conflict',
	'unprocessable entity',
	'too many requests',
	'internal server error',
	'service unavailable',
]);

const statusMessages: Readonly<Record<number, string>> = {
	400: 'Não foi possível processar a solicitação.',
	401: 'Sua autenticação não é válida. Verifique suas credenciais ou entre novamente.',
	403: 'Você não tem permissão para realizar esta ação.',
	404: 'O recurso solicitado não foi encontrado.',
	408: 'A solicitação demorou demais. Tente novamente.',
	409: 'A solicitação entrou em conflito com os dados atuais.',
	422: 'Alguns dados informados são inválidos.',
	429: 'Muitas solicitações foram feitas. Aguarde e tente novamente.',
	500: 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.',
	502: 'O serviço está temporariamente indisponível. Tente novamente mais tarde.',
	503: 'O serviço está temporariamente indisponível. Tente novamente mais tarde.',
	504: 'O servidor demorou demais para responder. Tente novamente.',
};

export const SKIP_HTTP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

export const httpErrorInterceptor: HttpInterceptorFn = (
	request: HttpRequest<unknown>,
	next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
	const toast = inject(AppToastService);

	return next(request).pipe(
		catchError((error: unknown) => {
			const skipToast =
				request.context.get(SKIP_HTTP_ERROR_TOAST) ||
				(error instanceof HttpErrorResponse && isRefreshHandledAuthError(error));

			if (error instanceof HttpErrorResponse && !skipToast) {
				toast.show(getHttpErrorMessage(error), 'error');
			}

			return throwError(() => error);
		}),
	);
};

export function getHttpErrorMessage(error: HttpErrorResponse): string {
	if (error.status === 0) {
		return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
	}

	if (error.status >= 500) {
		return statusMessages[error.status] ?? 'O serviço encontrou um erro. Tente novamente mais tarde.';
	}

	return getBackendMessage(error.error) ?? statusMessages[error.status] ?? 'Não foi possível concluir a solicitação.';
}

function getBackendMessage(body: unknown): string | null {
	if (!isApiErrorResponse(body)) {
		return null;
	}

	const messages = Array.isArray(body.message) ? body.message : [body.message];
	const message = messages
		.filter((item): item is string => typeof item === 'string')
		.map((item) => item.trim())
		.filter(Boolean)
		.join(' ');

	return message && !genericBackendMessages.has(message.toLowerCase()) ? message : null;
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
	return typeof value === 'object' && value !== null && 'message' in value;
}

/** Erros que o refresh interceptor trata (evita toast duplicado). */
function isRefreshHandledAuthError(error: HttpErrorResponse): boolean {
	if (error.status !== 401 || !isApiErrorResponse(error.error)) {
		return false;
	}
	const code = error.error.error;
	return code === 'TOKEN_EXPIRED' || code === 'REFRESH_EXPIRED';
}
