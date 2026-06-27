import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infra/database/database.module';
import { PasswordHashingService } from '../auth/infra/services/password-hashing.service';
import { UsuarioService } from './application/services/usuario.service';
import { AtualizarUsuarioUseCase } from './application/use-cases/atualizar-usuario.use-case';
import { CriarUsuarioUseCase } from './application/use-cases/criar-usuario.use-case';
import { DeletarUsuarioUseCase } from './application/use-cases/deletar-usuario.use-case';
import { FindByEmailUserUseCase } from './application/use-cases/findByEmailUser';
import { IUSUARIO_REPOSITORY } from './domain/repositories/i-usuario.repository';
import { PrismaUsuarioRepository } from './infrastructure/repositories/prisma-usuario.repository';
import { UsuarioController } from './presentation/controllers/usuario.controller';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

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
		FindByEmailUserUseCase,
		AtualizarUsuarioUseCase,
		DeletarUsuarioUseCase,
		UsuarioService,
	],
	exports: [UsuarioService, IUSUARIO_REPOSITORY],
})
export class UsuarioModule {}
