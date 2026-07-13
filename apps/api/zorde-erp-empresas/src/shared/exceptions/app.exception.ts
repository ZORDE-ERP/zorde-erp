export abstract class AppException extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export class EntityNotFoundException extends AppException {
  constructor(entity: string, id?: string) {
    const message = id ? `${entity} ${id} não encontrado` : `${entity} não encontrado`;
    super(404, message);
  }
}

export class ConflictException extends AppException {
  constructor(message: string) {
    super(409, message);
  }
}

export class BusinessRuleException extends AppException {
  constructor(message: string) {
    super(400, message);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message = 'Não autorizado') {
    super(401, message);
  }
}

export class ForbiddenException extends AppException {
  constructor(message = 'Acesso negado') {
    super(403, message);
  }
}
