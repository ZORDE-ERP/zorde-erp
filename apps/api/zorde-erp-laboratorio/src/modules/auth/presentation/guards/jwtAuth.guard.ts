import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/shared/decorators/publicRoutes.decorator';

@Injectable()
export class JwtAuthGuardStrategy extends AuthGuard('jwt') {
	public constructor(private readonly reflector: Reflector) {
		super();
	}

	public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

		if (isPublic) {
			return true;
		}

		return super.canActivate(context);
	}
}
