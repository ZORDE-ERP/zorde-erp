export abstract class AppException extends Error {
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EntityNotFoundException extends AppException {
  readonly statusCode = 404;
}

export class ConflictException extends AppException {
  readonly statusCode = 409;
}

export class BusinessRuleException extends AppException {
  readonly statusCode = 400;
}

export class UnauthorizedException extends AppException {
  readonly statusCode = 401;
}
