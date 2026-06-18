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
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import * as crypto from 'crypto';
import type { LoginDto} from '../dto/loginDto';
import { loginDtoSchema } from '../dto/loginDto';
import { IsUserValidGuard } from '../guards/validationUser.guard';
import { JwtAuthGuardStrategy } from '../guards/jwtAuth.guard';
import { globalEnvironment } from 'src/config/env.validation';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(IsUserValidGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginDtoSchema))
  public async handleLogin(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const cleanIp = ip.split(',')[0].trim();

    const { accessToken, refreshToken, usuario } = await this.authService.login(dto, cleanIp, userAgent);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: globalEnvironment.APP_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return {
      accessToken,
      refreshToken,
      usuario,
    };
  }

  @Post('refresh')
  // @UseGuards(JwtAuthGuardStrategy)
  @HttpCode(HttpStatus.OK)
  public async handleRefresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    

    const result = await this.authService.refresh(refreshToken);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: globalEnvironment.APP_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

  
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      usuario: result.usuario,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuardStrategy)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.sub);
    res.clearCookie('Fgp');
  }
}
