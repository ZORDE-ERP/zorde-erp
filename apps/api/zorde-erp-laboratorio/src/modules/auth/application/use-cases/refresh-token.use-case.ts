import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { I_AUTENTICACAO_REPOSITORY } from '../../domain/repositories/i-autenticacao.repository';
import type { IAutenticacaoRepository } from '../../domain/repositories/i-autenticacao.repository';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { AutenticacaoEntity } from '../../domain/entities/autenticacao.entity';
import { UnauthorizedException } from '../../../../shared/errors/app.exception';
import { StatusSessao } from '../../../../shared/enums/status-sessao.enum';
import { I_USUARIO_REPOSITORY } from '../../../usuario/domain/repositories/i-usuario.repository';
import type { IUsuarioRepository } from '../../../usuario/domain/repositories/i-usuario.repository';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(I_AUTENTICACAO_REPOSITORY)
    private readonly autenticacaoRepository: IAutenticacaoRepository,
    @Inject(I_USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(refreshToken: string, clientIp: string, clientUserAgent: string): Promise<AuthResponseDto> {
    const sessao = await this.autenticacaoRepository.buscarPorRefreshToken(refreshToken);
    if (!sessao || sessao.status !== StatusSessao.LOGADO) {
      throw new UnauthorizedException('Sessão inativa ou inválida');
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
    } catch (err) {
      // Se expirar ou falhar, revoga a sessão no banco
      await this.autenticacaoRepository.atualizarStatus(sessao.id, StatusSessao.OFFLINE);
      throw new UnauthorizedException('Token de atualização expirado ou inválido');
    }

    // Validar Fingerprint do IP/UA atual em relação ao gravado no Token
    const cleanIp = clientIp.split(',')[0].trim();
    const expectedFgpHash = crypto
      .createHash('sha256')
      .update(`${cleanIp}|${clientUserAgent}`)
      .digest('hex');

    if (payload.fingerprint !== expectedFgpHash) {
      await this.autenticacaoRepository.atualizarStatus(sessao.id, StatusSessao.OFFLINE);
      throw new UnauthorizedException('Sessão revogada devido a alteração de fingerprint');
    }

    const usuario = await this.usuarioRepository.buscarPorId(payload.sub);
    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Invalida a sessão antiga
    await this.autenticacaoRepository.atualizarStatus(sessao.id, StatusSessao.OFFLINE);

    // Gerar nova sessão e novos tokens
    const newPayload = {
      sub: usuario.id,
      email: usuario.email,
      fingerprint: expectedFgpHash,
    };

    const newAccessToken = await this.jwtService.signAsync(newPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '12h',
    });

    const newRefreshToken = await this.jwtService.signAsync(newPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h',
    });

    // Parse básico do User Agent para dispositivo/navegador
    const { dispositivo, navegador } = this.parseUserAgent(clientUserAgent);

    const novaSessao = AutenticacaoEntity.create({
      idUsuario: usuario.id,
      refreshToken: newRefreshToken,
      status: StatusSessao.LOGADO,
      ip: cleanIp,
      dispositivo,
      navegador,
    });

    await this.autenticacaoRepository.criar(novaSessao);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
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
