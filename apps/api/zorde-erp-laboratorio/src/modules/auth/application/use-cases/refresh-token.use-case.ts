import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { IAUTENTICACAO_REPOSITORY } from '../../domain/repositories/i-autenticacao.repository';
import type { IAutenticacaoRepository } from '../../domain/repositories/i-autenticacao.repository';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { AutenticacaoEntity } from '../../domain/entities/autenticacao.entity';
import { UnauthorizedException } from '../../../../shared/errors/app.exception';
import { StatusSessao } from '../../../../shared/enums/status-sessao.enum';
import { IUSUARIO_REPOSITORY } from '../../../usuario/domain/repositories/i-usuario.repository';
import type { IUsuarioRepository } from '../../../usuario/domain/repositories/i-usuario.repository';
import { globalEnvironment } from '../../../../config/env.validation';
import { randomUUID } from 'crypto';
import { PasswordHashingService } from '../../infra/services/password-hashing.service';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
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
    };

    const user = await this.usuarioRepository.buscarPorId(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const autentication = await this.autenticacaoRepository.buscarPorJti(payload.jti);
    const verifyRefreshToken = await this.passwordHashingService.comparar(refreshToken, autentication?.getRefreshToken()!);
    if (!verifyRefreshToken) {
      await this.autenticacaoRepository.revogarRefreshToken(user.getId()!);
      throw new UnauthorizedException('Possível token roubado, todos os tokens foram revogados');
    }

    const newPayload = {
      sub: user.getId()!,
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

      this.jwtService.signAsync({...newPayload, jti}, {
        secret: globalEnvironment.JWT_SECRET,
        expiresIn: globalEnvironment.REFRESH_TOKEN_EXPIRES_IN,
      }),
    ]);

    const refreshTokenHashed = await this.passwordHashingService.hash(newRefreshToken);

    const novaSessao = new AutenticacaoEntity({
      idUsuario: user.getId()!,
      refreshToken: refreshTokenHashed,
      status: StatusSessao.LOGADO,
      jti,
      updatedAt: new Date(),
    });
    
    await this.autenticacaoRepository.atualizar(autentication?.getId()!, novaSessao);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      usuario: {
        id: user.getId()!,
        nome: user.getNome(),
        email: user.getEmail(),
        role: user.getTipoUsuario(),
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
