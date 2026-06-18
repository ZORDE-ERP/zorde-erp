import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../infra/database/database.module';
import { AuthService } from './application/services/auth.service';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { IAUTENTICACAO_REPOSITORY } from './domain/repositories/i-autenticacao.repository';
import { PrismaAutenticacaoRepository } from './infra/repositories/prisma-autenticacao.repository';
import { PasswordHashingService } from './infra/services/password-hashing.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { UsuarioModule } from '../usuario/usuario.module';
import { PassportModule } from '@nestjs/passport';
import { ValidationUserStrategy } from './infra/strategies/validationUser.strategy';
import { JwtStrategy } from './infra/strategies/jwt.strategy';
import { JwtAuthGuardStrategy } from './presentation/guards/jwtAuth.guard';

@Global()
@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '20m' },
      }),
    }),
    UsuarioModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    PasswordHashingService,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    AuthService,
    {
      provide: IAUTENTICACAO_REPOSITORY,
      useClass: PrismaAutenticacaoRepository,
    },
    ValidationUserStrategy,
    JwtStrategy,
    JwtAuthGuardStrategy,
  ],
  exports: [
    PasswordHashingService,
    IAUTENTICACAO_REPOSITORY,
    JwtModule,
  ],
})
export class AuthModule {}
