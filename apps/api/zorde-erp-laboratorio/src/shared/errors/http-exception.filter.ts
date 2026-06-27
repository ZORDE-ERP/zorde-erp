import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppException } from './app.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);

	public catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = 'Erro interno do servidor';
		let error = 'Internal Server Error';

		if (exception instanceof AppException) {
			status = exception.statusCode;
			message = exception.message;
			error = exception.constructor.name;
		} else if (exception instanceof HttpException) {
			status = exception.getStatus();
			const res = exception.getResponse();
			if (typeof res === 'object' && res !== null) {
				message = (res as { message?: string; error?: string }).message || exception.message;
				error = (res as { message?: string; error?: string }).error || exception.constructor.name;
			} else {
				message = exception.message;
				error = exception.constructor.name;
			}
		} else if (exception instanceof Error) {
			message = exception.message;
			error = exception.name;
			this.logger.error(`Exception não tratada: ${exception.message}`, exception.stack);
		} else {
			this.logger.error(`Exception não tratada do tipo desconhecido: ${JSON.stringify(exception)}`);
		}

		response.status(status).json({
			statusCode: status,
			message,
			error,
			timestamp: new Date().toISOString(),
			path: request.url,
		});
	}
}
