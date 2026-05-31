import { Injectable } from '@nestjs/common';
import { LoginUseCase } from '../use-cases/login.use-case';
import { RefreshTokenUseCase } from '../use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../use-cases/logout.use-case';
import { LoginDto } from '../dtos/login.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  async login(dto: LoginDto, clientIp: string, clientUserAgent: string): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(dto, clientIp, clientUserAgent);
  }

  async refresh(refreshToken: string, clientIp: string, clientUserAgent: string): Promise<AuthResponseDto> {
    return this.refreshTokenUseCase.execute(refreshToken, clientIp, clientUserAgent);
  }

  async logout(userId: number): Promise<void> {
    return this.logoutUseCase.execute(userId);
  }
}
