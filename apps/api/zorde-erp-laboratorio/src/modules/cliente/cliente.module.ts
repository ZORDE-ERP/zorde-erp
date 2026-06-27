import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infra/database/database.module';
import { ClienteService } from './application/services/cliente.service';
import { AtualizarClienteUseCase } from './application/use-cases/atualizar-cliente.use-case';
import { BuscarClienteUseCase } from './application/use-cases/buscar-cliente.use-case';
import { CriarClienteUseCase } from './application/use-cases/criar-cliente.use-case';
import { DeletarClienteUseCase } from './application/use-cases/deletar-cliente.use-case';
import { ListarClientesUseCase } from './application/use-cases/listar-clientes.use-case';
import { I_CLIENTE_REPOSITORY } from './domain/repositories/i-cliente.repository';
import { PrismaClienteRepository } from './infrastructure/repositories/prisma-cliente.repository';
import { ClienteController } from './presentation/controllers/cliente.controller';

@Module({
	imports: [DatabaseModule],
	controllers: [ClienteController],
	providers: [
		CriarClienteUseCase,
		BuscarClienteUseCase,
		ListarClientesUseCase,
		AtualizarClienteUseCase,
		DeletarClienteUseCase,
		ClienteService,
		{
			provide: I_CLIENTE_REPOSITORY,
			useClass: PrismaClienteRepository,
		},
	],
	exports: [ClienteService, I_CLIENTE_REPOSITORY],
})
export class ClienteModule {}
