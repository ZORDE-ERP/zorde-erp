import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { globalEnvironment } from '../../../../config/env.validation';
import { StatusSessao } from '../../../../shared/enums/status-sessao.enum';
import { UnauthorizedException } from '../../../../shared/errors/app.exception';
import type { IUsuarioRepository } from '../../../usuario/domain/repositories/i-usuario.repository';
import { IUSUARIO_REPOSITORY } from '../../../usuario/domain/repositories/i-usuario.repository';
import { AutenticacaoEntity } from '../../domain/entities/autenticacao.entity';
import type { IAutenticacaoRepository } from '../../domain/repositories/i-autenticacao.repository';
import { IAUTENTICACAO_REPOSITORY } from '../../domain/repositories/i-autenticacao.repository';
import { PasswordHashingService } from '../../infra/services/password-hashing.service';
import type { AuthResponseDto } from '../dtos/auth-response.dto';

@Injectable()
export class RefreshTokenUseCase {
	public constructor(
		@Inject(IAUTENTICACAO_REPOSITORY)
		private readonly autenticacaoRepository: IAutenticacaoRepository,
		@Inject(IUSUARIO_REPOSITORY)
		private readonly usuarioRepository: IUsuarioRepository,
		private readonly jwtService: JwtService,
		private readonly passwordHashingService: PasswordHashingService,
	) {}

	public async execute(refreshToken: string): Promise<AuthResponseDto> {
		const payload = await this.jwtService.verifyAsync(refreshToken, {
			secret: globalEnvironment.JWT_SECRET,
		});

		if (!payload) {
			throw new UnauthorizedException('Token de atualização expirado ou inválido');
		}

		const user = await this.usuarioRepository.buscarPorId(payload.sub);
		if (!user) {
			throw new UnauthorizedException('Usuário não encontrado');
		}

		const userId = user.getId();
		if (!userId) {
			throw new UnauthorizedException('Usuário não encontrado');
		}

		const autentication = await this.autenticacaoRepository.buscarPorJti(payload.jti);
		if (!autentication) {
			throw new UnauthorizedException('Sessão não encontrada');
		}

		const verifyRefreshToken = await this.passwordHashingService.comparar(
			refreshToken,
			autentication.getRefreshToken() as string,
		);
		if (!verifyRefreshToken) {
			await this.autenticacaoRepository.revogarRefreshToken(userId);
			throw new UnauthorizedException('Possível token roubado, todos os tokens foram revogados');
		}

		const newPayload = {
			sub: userId,
			role: user.getTipoUsuario(),
			email: user.getEmail(),
			nome: user.getNome(),
		};

		const jti = randomUUID();

		const [newAccessToken, newRefreshToken] = await Promise.all([
			this.jwtService.signAsync(newPayload, {
				secret: globalEnvironment.JWT_SECRET,
				expiresIn: globalEnvironment.JWT_SECRET_EXPIRES_IN,
			}),

			this.jwtService.signAsync(
				{ ...newPayload, jti },
				{
					secret: globalEnvironment.JWT_SECRET,
					expiresIn: globalEnvironment.REFRESH_TOKEN_EXPIRES_IN,
				},
			),
		]);

		const refreshTokenHashed = await this.passwordHashingService.hash(newRefreshToken);

		const novaSessao = new AutenticacaoEntity({
			idUsuario: userId,
			refreshToken: refreshTokenHashed,
			status: StatusSessao.LOGADO,
			jti,
			updatedAt: new Date(),
		});

		const autenticationId = autentication.getId();
		if (!autenticationId) {
			throw new UnauthorizedException('ID da sessão não encontrado');
		}
		await this.autenticacaoRepository.atualizar(autenticationId, novaSessao);

		return {
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
			usuario: {
				id: userId,
				nome: user.getNome(),
				email: user.getEmail(),
				role: user.getTipoUsuario(),
			},
		};
	}
}
