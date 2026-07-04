import { Module } from '@nestjs/common';
import { EnderecoAdapterRepository } from 'src/shared/infra/persistence/enderecoAdapter.repository';
import { DatabaseModule } from '../../infra/database/database.module';
import { FornecedorService } from './application/services/fornecedor.service';
import { UpdateFornecedorUseCase } from './application/use-cases/atualizarFornecedor.useCase';
import { FindByIdFornecedorUseCase } from './application/use-cases/buscarFornecedor.useCase';
import { CreateFornecedorUseCase } from './application/use-cases/criarFornecedor.useCase';
import { DeleteFornecedorUseCase } from './application/use-cases/deletarFornecedor.useCase';
import { FindAllFornecedoresUseCase } from './application/use-cases/listarFornecedores.useCase';
import { IFORNECEDOR_REPOSITORY } from './domain/repositories/fornecedor.repository';
import { PrismaFornecedorRepository } from './infrastructure/repositories/fornecedorAdapter.repository';
import { FornecedorController } from './presentation/controllers/fornecedor.controller';

@Module({
	imports: [DatabaseModule],
	controllers: [FornecedorController],
	providers: [
		EnderecoAdapterRepository,
		CreateFornecedorUseCase,
		FindByIdFornecedorUseCase,
		FindAllFornecedoresUseCase,
		UpdateFornecedorUseCase,
		DeleteFornecedorUseCase,
		FornecedorService,
		{
			provide: IFORNECEDOR_REPOSITORY,
			useClass: PrismaFornecedorRepository,
		},
	],
	exports: [FornecedorService, IFORNECEDOR_REPOSITORY],
})
export class FornecedorModule {}
