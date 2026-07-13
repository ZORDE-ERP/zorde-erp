import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CHECK_PERMISSION_KEY,
  PermissionCheck,
} from '../../shared/decorators/check-permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<PermissionCheck>(
      CHECK_PERMISSION_KEY,
      context.getHandler(),
    ) as PermissionCheck | undefined;

    // Se não há permissão requerida, permite
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.permissions) {
      throw new ForbiddenException('Permissão negada');
    }

    const hasPermission = user.permissions.some(
      (perm: any) =>
        perm.resource === requiredPermission.resource &&
        perm.action === requiredPermission.action,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Permissão negada: ${requiredPermission.resource}:${requiredPermission.action}`,
      );
    }

    return true;
  }
}
