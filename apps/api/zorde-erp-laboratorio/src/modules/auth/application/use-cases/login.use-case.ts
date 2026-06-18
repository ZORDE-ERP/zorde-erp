import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUSUARIO_REPOSITORY } from '../../../usuario/domain/repositories/i-usuario.repository';
import type { IUsuarioRepository } from '../../../usuario/domain/repositories/i-usuario.repository';
import { IAUTENTICACAO_REPOSITORY } from '../../domain/repositories/i-autenticacao.repository';
import type { IAutenticacaoRepository } from '../../domain/repositories/i-autenticacao.repository';
import { PasswordHashingService } from '../../infra/services/password-hashing.service';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { AutenticacaoEntity } from '../../domain/entities/autenticacao.entity';
import { UnauthorizedException } from '../../../../shared/errors/app.exception';
import { StatusSessao } from '../../../../shared/enums/status-sessao.enum';
import type { LoginDto } from '../../presentation/dto/loginDto';
import { globalEnvironment } from '../../../../config/env.validation';
import { randomUUID } from 'node:crypto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(IUSUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(IAUTENTICACAO_REPOSITORY)
    private readonly autenticacaoRepository: IAutenticacaoRepository,
    private readonly passwordHashingService: PasswordHashingService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    dto: LoginDto,
    clientIp: string,
    clientUserAgent: string,
  ): Promise<AuthResponseDto> {
    const usuario = await this.usuarioRepository.buscarPorEmail(dto.email);

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: usuario.getId()!,
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

      this.jwtService.signAsync({...payload, jti}, {
        secret: globalEnvironment.JWT_SECRET,
        expiresIn: globalEnvironment.REFRESH_TOKEN_EXPIRES_IN,
        notBefore: '0s',
      }),
    ]);

    const refreshTokenHashed = await this.passwordHashingService.hash(refreshToken);

    // Criar e salvar sessão de autenticação ativa
    const autenticacao = new AutenticacaoEntity({
      idUsuario: usuario.getId()!,
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
    await this.usuarioRepository.atualizar(usuario.getId()!, {
      ultimoAcesso: new Date(),
    });

    return {
      accessToken,
      refreshToken,
      usuario: {
        id: usuario.getId()!,
        nome: usuario.getNome(),
        email: usuario.getEmail(),
        role: usuario.getTipoUsuario(),
      },
    };
  }

  private parseUserAgent(ua: string) {
    const isMobile = /mobile/i.test(ua);
    const isTablet = /tablet/i.test(ua);

    let dispositivo = 'Desktop';
    if (isMobile) dispositivo = 'Mobile';
    if (isTablet) dispositivo = 'Tablet';

    let navegador = 'Desconhecido';
    if (/chrome/i.test(ua)) navegador = 'Chrome';
    else if (/safari/i.test(ua)) navegador = 'Safari';
    else if (/firefox/i.test(ua)) navegador = 'Firefox';
    else if (/edge/i.test(ua)) navegador = 'Edge';

    return { dispositivo, navegador };
  }
}
