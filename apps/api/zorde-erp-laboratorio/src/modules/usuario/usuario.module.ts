import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '../../infra/database/database.module';
import { UsuarioService } from './application/services/usuario.service';
import { CriarUsuarioUseCase } from './application/use-cases/criar-usuario.use-case';
import { FindByEmailUserUseCase } from './application/use-cases/findByEmailUser';
import { AtualizarUsuarioUseCase } from './application/use-cases/atualizar-usuario.use-case';
import { DeletarUsuarioUseCase } from './application/use-cases/deletar-usuario.use-case';
import { IUSUARIO_REPOSITORY } from './domain/repositories/i-usuario.repository';
import { PrismaUsuarioRepository } from './infrastructure/repositories/prisma-usuario.repository';
import { UsuarioController } from './presentation/controllers/usuario.controller';
import { AuthModule } from '../auth/auth.module';
import { BcryptService } from 'src/shared/utils/bcrypt.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [UsuarioController],
  providers: [
    BcryptService,
    CriarUsuarioUseCase,
    FindByEmailUserUseCase,
    AtualizarUsuarioUseCase,
    DeletarUsuarioUseCase,
    UsuarioService,
    {
      provide: IUSUARIO_REPOSITORY,
      useClass: PrismaUsuarioRepository,
    },
  ],
  exports: [
    UsuarioService,
    IUSUARIO_REPOSITORY,
  ],
})
export class UsuarioModule {}
