import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { UnauthorizedException } from '../errors/app.exception';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticação não fornecido ou inválido');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Validação de Fingerprint (Paridade de segurança com Go)
      const fgpCookie = request.cookies.Fgp || request.cookies['__Secure-Fgp'];
      if (!fgpCookie) {
        throw new UnauthorizedException('Fingerprint cookie ausente');
      }

      const ip = (request.headers['x-forwarded-for'] as string) || request.ip || '127.0.0.1';
      const userAgent = request.headers['user-agent'] || 'unknown';
      const cleanIp = ip.split(',')[0].trim(); // Se houver proxy, pega o primeiro

      const expectedFgpHash = crypto
        .createHash('sha256')
        .update(`${cleanIp}|${userAgent}`)
        .digest('hex');

      if (fgpCookie !== expectedFgpHash) {
        throw new UnauthorizedException('Sessão inválida: fingerprint divergente');
      }

      if (payload.fingerprint !== expectedFgpHash) {
        throw new UnauthorizedException('Token inválido: fingerprint do token divergente');
      }

      request.user = payload;
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Falha na autenticação do token');
    }
  }
}
