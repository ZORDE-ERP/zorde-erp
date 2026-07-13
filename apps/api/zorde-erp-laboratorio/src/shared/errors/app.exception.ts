export abstract class AppException extends Error {
	public abstract readonly statusCode: number;

	public constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export class EntityNotFoundException extends AppException {
	public readonly statusCode = 404;
}

export class ConflictException extends AppException {
	public readonly statusCode = 409;
}

export class BusinessRuleException extends AppException {
	public readonly statusCode = 400;
}

export class UnauthorizedException extends AppException {
	public readonly statusCode = 401;
}
