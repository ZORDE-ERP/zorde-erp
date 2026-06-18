import { Injectable } from '@nestjs/common';
import { LoginUseCase } from '../use-cases/login.use-case';
import { RefreshTokenUseCase } from '../use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../use-cases/logout.use-case';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import type { LoginDto } from '../../presentation/dto/loginDto';
import { UsuarioService } from 'src/modules/usuario/application/services/usuario.service';
import { PasswordHashingService } from '../../infra/services/password-hashing.service';
import { UsuarioResponseDto } from 'src/modules/usuario/application/dtos/usuario-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly usuarioService: UsuarioService,
    private readonly passwordHashingService: PasswordHashingService,
  ) {}

  public async login(dto: LoginDto, clientIp: string, clientUserAgent: string): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(dto, clientIp, clientUserAgent);
  }

  public async refresh(refreshToken: string): Promise<AuthResponseDto> {
    return this.refreshTokenUseCase.execute(refreshToken);
  }

  public async logout(userId: number): Promise<void> {
    return this.logoutUseCase.execute(userId);
  }

  public async validateUser(email: string, password: string): Promise<Omit<UsuarioResponseDto, 'senha'> | null> {

    const user = await this.usuarioService.findByEmail(email);

    if (!user) return null;


    const isPasswordValid = await this.passwordHashingService.comparar(password, user.senha!);

    if (!isPasswordValid) return null;

    const {senha, ...result} = user;


    return result;
  }
}
