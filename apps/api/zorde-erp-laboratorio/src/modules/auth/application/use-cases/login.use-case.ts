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
import type { LoginDto } from '../../presentation/dto/loginDto';
import type { AuthResponseDto } from '../dtos/auth-response.dto';

@Injectable()
export class LoginUseCase {
	public constructor(
		@Inject(IUSUARIO_REPOSITORY)
		private readonly usuarioRepository: IUsuarioRepository,
		@Inject(IAUTENTICACAO_REPOSITORY)
		private readonly autenticacaoRepository: IAutenticacaoRepository,
		private readonly passwordHashingService: PasswordHashingService,
		private readonly jwtService: JwtService,
	) {}

	public async execute(dto: LoginDto, clientIp: string, clientUserAgent: string): Promise<AuthResponseDto> {
		const usuario = await this.usuarioRepository.buscarPorEmail(dto.email);

		if (!usuario) {
			throw new UnauthorizedException('Credenciais inválidas');
		}

		const userId = usuario.getId();
		if (!userId) {
			throw new UnauthorizedException('Credenciais inválidas');
		}

		const payload = {
			sub: userId,
			role: usuario.getTipoUsuario(),
			nome: usuario.getNome(),
		};

		const jti = randomUUID();
		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(payload, {
				secret: globalEnvironment.JWT_SECRET,
				expiresIn: globalEnvironment.JWT_SECRET_EXPIRES_IN,
				issuer: globalEnvironment.SERVER_URL,
				notBefore: '0s',
			}),

			this.jwtService.signAsync(
				{ ...payload, jti },
				{
					secret: globalEnvironment.JWT_SECRET,
					expiresIn: globalEnvironment.REFRESH_TOKEN_EXPIRES_IN,
					notBefore: '0s',
				},
			),
		]);

		const refreshTokenHashed = await this.passwordHashingService.hash(refreshToken);

		// Criar e salvar sessão de autenticação ativa
		const autenticacao = new AutenticacaoEntity({
			idUsuario: userId,
			refreshToken: refreshTokenHashed,
			status: StatusSessao.LOGADO,
			ip: clientIp,
			dispositivo: clientUserAgent,
			navegador: clientUserAgent,
			createdAt: new Date(),
			jti,
		});

		await this.autenticacaoRepository.criar(autenticacao);

		// // Atualizar último acesso do usuário
		await this.usuarioRepository.atualizar(userId, {
			ultimoAcesso: new Date(),
		});

		return {
			accessToken,
			refreshToken,
			usuario: {
				id: userId,
				nome: usuario.getNome(),
				email: usuario.getEmail(),
				role: usuario.getTipoUsuario(),
			},
		};
	}
}
