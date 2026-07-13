import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import type { AppException } from '../exceptions/app.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let statusCode = 500;
    let message = 'Erro interno do servidor';
    let error = 'INTERNAL_SERVER_ERROR';

    // Check if it's an AppException (custom exception)
    if (exception && typeof exception === 'object' && 'statusCode' in exception) {
      statusCode = exception.statusCode;
      message = exception.message || message;
      error = exception.constructor?.name || error;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
      } else {
        message = exceptionResponse as string;
      }
      error = exception.constructor.name;
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.constructor.name;
      this.logger.error(exception.stack);
    }

    this.logger.error(
      `${request.method} ${request.url} - ${statusCode} - ${message}`,
    );

    response.status(statusCode).json({
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
