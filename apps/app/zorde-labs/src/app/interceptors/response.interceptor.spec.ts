import { HttpErrorResponse } from '@angular/common/http';
import { getHttpErrorMessage } from './response.interceptor';

describe('getHttpErrorMessage', () => {
	it('should describe network failures when the status is zero', () => {
		const error = new HttpErrorResponse({ status: 0 });

		expect(getHttpErrorMessage(error)).toContain('conectar ao servidor');
	});

	it('should use a backend validation message', () => {
		const error = new HttpErrorResponse({
			status: 422,
			error: { message: ['E-mail inválido', 'Senha obrigatória'] },
		});

		expect(getHttpErrorMessage(error)).toBe('E-mail inválido Senha obrigatória');
	});

	it('should replace generic backend messages with a localized message', () => {
		const error = new HttpErrorResponse({
			status: 401,
			error: { message: 'Unauthorized' },
		});

		expect(getHttpErrorMessage(error)).toContain('autenticação');
	});

	it('should not expose internal server error details', () => {
		const error = new HttpErrorResponse({
			status: 500,
			error: { message: 'Database connection failed' },
		});

		expect(getHttpErrorMessage(error)).toBe('Ocorreu um erro interno no servidor. Tente novamente mais tarde.');
	});
});
