import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto, loginSchema } from '../../application/dtos/login.dto';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import * as crypto from 'crypto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const cleanIp = ip.split(',')[0].trim();

    const result = await this.authService.login(dto, cleanIp, userAgent);

    // Gerar hash de fingerprint para o cookie
    const fingerprintHash = crypto
      .createHash('sha256')
      .update(`${cleanIp}|${userAgent}`)
      .digest('hex');

    const isProduction = process.env.APP_ENV === 'production';
    
    // Configurar o cookie seguro contendo o fingerprint da sessão
    res.cookie('Fgp', fingerprintHash, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    });

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      usuario: result.usuario,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body('refreshToken') bodyRefreshToken: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = bodyRefreshToken || req.cookies?.refreshToken;
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const cleanIp = ip.split(',')[0].trim();

    const result = await this.authService.refresh(refreshToken, cleanIp, userAgent);

    // Recalcular e atualizar o cookie Fgp
    const fingerprintHash = crypto
      .createHash('sha256')
      .update(`${cleanIp}|${userAgent}`)
      .digest('hex');

    const isProduction = process.env.APP_ENV === 'production';

    res.cookie('Fgp', fingerprintHash, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    });

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      usuario: result.usuario,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.sub);
    res.clearCookie('Fgp');
  }
}
