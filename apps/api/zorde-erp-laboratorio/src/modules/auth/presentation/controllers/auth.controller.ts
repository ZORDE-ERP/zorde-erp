import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import type { Request, Response } from 'express';
import { globalEnvironment } from 'src/config/env.validation';
import { Public } from 'src/shared/decorators/publicRoutes.decorator';
import { User } from '../../../../shared/decorators/user.decorator';
import type { JwtPayload } from '../../../../shared/interfaces/jwtPayload.interface';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe';
import type { AuthResponseDto } from '../../application/dtos/auth-response.dto';
import { AuthService } from '../../application/services/auth.service';
import type { LoginDto } from '../dto/loginDto';
import { loginDtoSchema } from '../dto/loginDto';
import { JwtAuthGuardStrategy } from '../guards/jwtAuth.guard';
import { IsUserValidGuard } from '../guards/validationUser.guard';

@Controller('api/auth')
export class AuthController {
	public constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('login')
	@UseGuards(IsUserValidGuard)
	@HttpCode(HttpStatus.OK)
	@UsePipes(new ZodValidationPipe(loginDtoSchema))
	public async handleLogin(
		@Body() dto: LoginDto,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<AuthResponseDto> {
		const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
		const userAgent = req.headers['user-agent'] || 'unknown';
		const cleanIp = ip.split(',')[0].trim();

		const { accessToken, refreshToken, usuario } = await this.authService.login(dto, cleanIp, userAgent);

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: globalEnvironment.APP_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		return {
			accessToken,
			refreshToken,
			usuario,
		};
	}

	@Public()
	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	public async handleRefresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<AuthResponseDto> {
		const refreshToken = req.cookies?.refreshToken;

		const result = await this.authService.refresh(refreshToken);

		res.cookie('refreshToken', result.refreshToken, {
			httpOnly: true,
			secure: globalEnvironment.APP_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
	public async logout(@User() user: JwtPayload, @Res({ passthrough: true }) res: Response): Promise<void> {
		await this.authService.logout(user.sub);
		res.clearCookie('Fgp');
	}
}
