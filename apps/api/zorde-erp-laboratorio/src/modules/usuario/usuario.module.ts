import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '../../infra/database/database.module';
import { UsuarioService } from './application/services/usuario.service';
import { CriarUsuarioUseCase } from './application/use-cases/criar-usuario.use-case';
import { ListarUsuariosUseCase } from './application/use-cases/listar-usuarios.use-case';
import { AtualizarUsuarioUseCase } from './application/use-cases/atualizar-usuario.use-case';
import { DeletarUsuarioUseCase } from './application/use-cases/deletar-usuario.use-case';
import { I_USUARIO_REPOSITORY } from './domain/repositories/i-usuario.repository';
import { PrismaUsuarioRepository } from './infrastructure/repositories/prisma-usuario.repository';
import { UsuarioController } from './presentation/controllers/usuario.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UsuarioController],
  providers: [
    CriarUsuarioUseCase,
    ListarUsuariosUseCase,
    AtualizarUsuarioUseCase,
    DeletarUsuarioUseCase,
    UsuarioService,
    {
      provide: I_USUARIO_REPOSITORY,
      useClass: PrismaUsuarioRepository,
    },
  ],
  exports: [
    UsuarioService,
    I_USUARIO_REPOSITORY,
  ],
})
export class UsuarioModule {}
