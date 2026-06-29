import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { globalEnvironment } from 'src/config/env.validation';

interface JwtPayload {
	sub: number;
	role: string;
	nome: string;
	jti?: string;
	iat?: number;
	exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	public constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: globalEnvironment.JWT_SECRET,
			algorithms: ['HS256', 'RS256'],
		});
	}

	public async validate(payload: JwtPayload): Promise<{ userId: number; nome: string; role: string }> {
		return { userId: payload.sub as number, nome: payload.nome, role: payload.role };
	}
}
