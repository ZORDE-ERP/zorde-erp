import { Module } from '@nestjs/common';
import { EnderecoAdapterRepository } from 'src/shared/infra/persistence/enderecoAdapter.repository';
import { DatabaseModule } from '../../infra/database/database.module';
import { ClienteService } from './application/services/cliente.service';
import { AtualizarClienteUseCase } from './application/use-cases/atualizarCliente.useCase';
import { BuscarClienteUseCase } from './application/use-cases/buscarCliente.useCase';
import { CriarClienteUseCase } from './application/use-cases/criarCliente.useCase';
import { DeletarClienteUseCase } from './application/use-cases/deletarCliente.useCase';
import { ListarClientesUseCase } from './application/use-cases/listarClientes.useCase';
import { ICLIENTE_REPOSITORY } from './domain/repositories/cliente.repository';
import { PrismaClienteRepository } from './infrastructure/repositories/clienteAdapter.repository';
import { ClienteController } from './presentation/controllers/cliente.controller';

@Module({
	imports: [DatabaseModule],
	controllers: [ClienteController],
	providers: [
		EnderecoAdapterRepository,
		CriarClienteUseCase,
		BuscarClienteUseCase,
		ListarClientesUseCase,
		AtualizarClienteUseCase,
		DeletarClienteUseCase,
		ClienteService,
		{
			provide: ICLIENTE_REPOSITORY,
			useClass: PrismaClienteRepository,
		},
	],
	exports: [ClienteService, ICLIENTE_REPOSITORY],
})
export class ClienteModule {}
