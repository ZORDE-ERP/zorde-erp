import { forwardRef, Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../infra/database/database.module';
import { AuthService } from './application/services/auth.service';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { I_AUTENTICACAO_REPOSITORY } from './domain/repositories/i-autenticacao.repository';
import { PrismaAutenticacaoRepository } from './infra/repositories/prisma-autenticacao.repository';
import { PasswordHashingService } from './infra/services/password-hashing.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { UsuarioModule } from '../usuario/usuario.module';

@Global()
@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '12h' },
      }),
    }),
    forwardRef(() => UsuarioModule),
  ],
  controllers: [AuthController],
  providers: [
    PasswordHashingService,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    AuthService,
    {
      provide: I_AUTENTICACAO_REPOSITORY,
      useClass: PrismaAutenticacaoRepository,
    },
  ],
  exports: [
    AuthService,
    PasswordHashingService,
    I_AUTENTICACAO_REPOSITORY,
    JwtModule,
  ],
})
export class AuthModule {}
