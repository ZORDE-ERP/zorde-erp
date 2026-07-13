import { ArgumentsHost, HttpException, BadRequestException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue({
          method: 'POST',
          url: '/api/test',
        }),
      }),
    } as any;
  });

  describe('catch - AppException', () => {
    it('should handle custom AppException with statusCode', () => {
      const customException = {
        statusCode: 409,
        message: 'Resource already exists',
        constructor: { name: 'ConflictException' },
      };

      filter.catch(customException, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 409,
          message: 'Resource already exists',
          error: 'ConflictException',
        }),
      );
    });

    it('should include timestamp in error response', () => {
      const customException = {
        statusCode: 404,
        message: 'Not found',
        constructor: { name: 'EntityNotFoundException' },
      };

      filter.catch(customException, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
      );
    });

    it('should include request path in error response', () => {
      const customException = {
        statusCode: 403,
        message: 'Forbidden',
        constructor: { name: 'ForbiddenException' },
      };

      filter.catch(customException, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/test',
        }),
      );
    });
  });

  describe('catch - HttpException', () => {
    it('should handle HttpException', () => {
      const httpException = new BadRequestException('Invalid input');

      filter.catch(httpException, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          error: 'BadRequestException',
        }),
      );
    });

    it('should handle HttpException with object response', () => {
      const httpException = new HttpException(
        { message: 'Custom message', code: 'CUSTOM' },
        422,
      );

      filter.catch(httpException, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 422,
          message: 'Custom message',
        }),
      );
    });
  });

  describe('catch - Generic Error', () => {
    it('should handle generic Error objects', () => {
      const error = new Error('Something went wrong');

      filter.catch(error, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Something went wrong',
          error: 'Error',
        }),
      );
    });

    it('should default to 500 status for unknown errors', () => {
      const unknownError = { some: 'object' };

      filter.catch(unknownError, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Erro interno do servidor',
        }),
      );
    });
  });

  describe('catch - Error logging', () => {
    it('should log error with method, url, and status', () => {
      const loggerSpy = jest.spyOn(filter['logger'], 'error');
      const customException = {
        statusCode: 404,
        message: 'Not found',
        constructor: { name: 'EntityNotFoundException' },
      };

      filter.catch(customException, mockHost);

      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('POST /api/test - 404'));
    });

    it('should log stack trace for Error objects', () => {
      const loggerSpy = jest.spyOn(filter['logger'], 'error');
      const error = new Error('Test error');

      filter.catch(error, mockHost);

      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('POST /api/test - 500'));
    });
  });

  describe('catch - Response format', () => {
    it('should return consistent response structure', () => {
      const customException = {
        statusCode: 400,
        message: 'Bad request',
        constructor: { name: 'ValidationException' },
      };

      filter.catch(customException, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: expect.any(Number),
          message: expect.any(String),
          error: expect.any(String),
          timestamp: expect.any(String),
          path: expect.any(String),
        }),
      );
    });

    it('should handle null response message from HttpException', () => {
      const httpException = new HttpException(null, 500);

      filter.catch(httpException, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
        }),
      );
    });
  });
});
