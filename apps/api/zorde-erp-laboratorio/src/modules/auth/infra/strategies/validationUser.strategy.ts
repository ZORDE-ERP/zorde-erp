import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsuarioResponseDto } from 'src/modules/usuario/application/dtos/usuarioResponse.dto';
import { AuthService } from '../../application/services/auth.service';

@Injectable()
export class ValidationUserStrategy extends PassportStrategy(Strategy, 'IsUserValid') {
	private authService: AuthService;
	public constructor(private moduleRef: ModuleRef) {
		super({
			passReqToCallback: true,
			usernameField: 'email',
			passwordField: 'senha',
		});
	}

	public async validate(request: Request, email: string, password: string): Promise<UsuarioResponseDto | null> {
		const contextId = ContextIdFactory.getByRequest(request);
		this.authService = await this.moduleRef.resolve(AuthService, contextId);
		const user = await this.authService.validateUser(email, password);
		if (!user) {
			throw new UnauthorizedException();
		}
		// TODO: Salvar os dados do usuario no redis em cache para evitar consultas repetidas;
		return user;
	}
}
