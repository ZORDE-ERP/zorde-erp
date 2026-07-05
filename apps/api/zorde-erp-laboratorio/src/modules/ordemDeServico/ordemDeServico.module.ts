import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infra/database/database.module';
import { ClienteModule } from '../cliente/cliente.module';
import { TabelaMontagemModule } from '../tabelaMontagem/tabelaMontagem.module';
import { ServiceOrderService } from './application/services/ordemDeServico.service';
import { UpdateServiceOrderUseCase } from './application/use-cases/atualizarOrdem.useCase';
import { FindByIdServiceOrderUseCase } from './application/use-cases/buscarOrdem.useCase';
import { CreateServiceOrderUseCase } from './application/use-cases/criarOrdem.useCase';
import { DeleteServiceOrderUseCase } from './application/use-cases/deletarOrdem.useCase';
import { FindAllServiceOrdersUseCase } from './application/use-cases/listarOrdem.useCase';
import { ISERVICE_ORDER_REPOSITORY } from './domain/repositories/ordemDeServico.repository';
import { PrismaServiceOrderRepository } from './infrastructure/repositories/ordemDeServicoAdapter.repository';
import { ServiceOrderController } from './presentation/controllers/ordemDeServico.controller';

@Module({
	imports: [DatabaseModule, ClienteModule, TabelaMontagemModule],
	controllers: [ServiceOrderController],
	providers: [
		ServiceOrderService,
		CreateServiceOrderUseCase,
		FindByIdServiceOrderUseCase,
		FindAllServiceOrdersUseCase,
		UpdateServiceOrderUseCase,
		DeleteServiceOrderUseCase,
		{
			provide: ISERVICE_ORDER_REPOSITORY,
			useClass: PrismaServiceOrderRepository,
		},
	],
	exports: [ServiceOrderService],
})
export class ServiceOrderModule {}
