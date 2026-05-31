import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { I_USUARIO_REPOSITORY } from '../../../usuario/domain/repositories/i-usuario.repository';
import type { IUsuarioRepository } from '../../../usuario/domain/repositories/i-usuario.repository';
import { I_AUTENTICACAO_REPOSITORY } from '../../domain/repositories/i-autenticacao.repository';
import type { IAutenticacaoRepository } from '../../domain/repositories/i-autenticacao.repository';
import { PasswordHashingService } from '../../infra/services/password-hashing.service';
import { LoginDto } from '../dtos/login.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { AutenticacaoEntity } from '../../domain/entities/autenticacao.entity';
import { UnauthorizedException } from '../../../../shared/errors/app.exception';
import { StatusSessao } from '../../../../shared/enums/status-sessao.enum';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(I_USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(I_AUTENTICACAO_REPOSITORY)
    private readonly autenticacaoRepository: IAutenticacaoRepository,
    private readonly passwordHashingService: PasswordHashingService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto, clientIp: string, clientUserAgent: string): Promise<AuthResponseDto> {
    const usuario = await this.usuarioRepository.buscarPorEmail(dto.email);
    if (!usuario || !usuario.senha) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isSenhaValida = await this.passwordHashingService.comparar(dto.senha, usuario.senha);
    if (!isSenhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar o fingerprint hash (SHA-256 de IP|UserAgent)
    const cleanIp = clientIp.split(',')[0].trim();
    const fingerprintHash = crypto
      .createHash('sha256')
      .update(`${cleanIp}|${clientUserAgent}`)
      .digest('hex');

    // Gerar payloads e assinar os tokens JWT
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      fingerprint: fingerprintHash,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '12h',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h',
    });

    // Parse básico do User Agent para dispositivo/navegador
    const { dispositivo, navegador } = this.parseUserAgent(clientUserAgent);

    // Criar e salvar sessão de autenticação ativa
    const autenticacao = AutenticacaoEntity.create({
      idUsuario: usuario.id,
      refreshToken,
      status: StatusSessao.LOGADO,
      ip: cleanIp,
      dispositivo,
      navegador,
    });

    await this.autenticacaoRepository.criar(autenticacao);

    // Atualizar último acesso do usuário
    await this.usuarioRepository.atualizar(usuario.id, {
      ultimoAcesso: new Date(),
    });

    return {
      accessToken,
      refreshToken,
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
