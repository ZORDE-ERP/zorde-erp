import { Module } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { DatabaseModule } from '../../infra/database/database.module';
import { PasswordHashingService } from '../auth/infra/services/password-hashing.service';
import { UsuarioService } from './application/services/usuario.service';
import { AtualizarUsuarioUseCase } from './application/use-cases/atualizarUsuario.useCase';
import { BuscarUsuarioPorEmailUseCase } from './application/use-cases/buscarUsuarioPorEmail.useCase';
import { CriarUsuarioUseCase } from './application/use-cases/criarUsuario.useCase';
import { DeletarUsuarioUseCase } from './application/use-cases/deletarUsuario.useCase';
import { IUSUARIO_REPOSITORY } from './domain/repositories/i-usuario.repository';
import { PrismaUsuarioRepository } from './infrastructure/repositories/usuarioAdapter.repository';
import { UsuarioController } from './presentation/controllers/usuario.controller';

@Module({
	imports: [DatabaseModule],
	controllers: [UsuarioController],
	providers: [
		{
			provide: IUSUARIO_REPOSITORY,
			useFactory: (prisma: PrismaService) => new PrismaUsuarioRepository(prisma),
			inject: [PrismaService],
		},
		PasswordHashingService,
		CriarUsuarioUseCase,
		BuscarUsuarioPorEmailUseCase,
		AtualizarUsuarioUseCase,
		DeletarUsuarioUseCase,
		UsuarioService,
	],
	exports: [UsuarioService, IUSUARIO_REPOSITORY],
})
export class UsuarioModule {}
