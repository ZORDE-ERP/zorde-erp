import { Module } from '@nestjs/common';
import { EnderecoAdapterRepository } from 'src/shared/infra/persistence/enderecoAdapter.repository';
import { LogoImageService } from 'src/shared/infra/services/logoImage.service';
import { DatabaseModule } from '../../infra/database/database.module';
import { FornecedorService } from './application/services/fornecedor.service';
import { UpdateFornecedorUseCase } from './application/use-cases/atualizarFornecedor.useCase';
import { FindByIdFornecedorUseCase } from './application/use-cases/buscarFornecedor.useCase';
import { CreateFornecedorUseCase } from './application/use-cases/criarFornecedor.useCase';
import { DeleteFornecedorUseCase } from './application/use-cases/deletarFornecedor.useCase';
import { FindAllFornecedoresUseCase } from './application/use-cases/listarFornecedores.useCase';
import { RemoverLogoFornecedorUseCase } from './application/use-cases/removerLogoFornecedor.useCase';
import { UploadLogoFornecedorUseCase } from './application/use-cases/uploadLogoFornecedor.useCase';
import { IFORNECEDOR_REPOSITORY } from './domain/repositories/fornecedor.repository';
import { PrismaFornecedorRepository } from './infrastructure/repositories/fornecedorAdapter.repository';
import { FornecedorController } from './presentation/controllers/fornecedor.controller';

@Module({
	imports: [DatabaseModule],
	controllers: [FornecedorController],
	providers: [
		EnderecoAdapterRepository,
		LogoImageService,
		CreateFornecedorUseCase,
		FindByIdFornecedorUseCase,
		FindAllFornecedoresUseCase,
		UpdateFornecedorUseCase,
		DeleteFornecedorUseCase,
		UploadLogoFornecedorUseCase,
		RemoverLogoFornecedorUseCase,
		FornecedorService,
		{
			provide: IFORNECEDOR_REPOSITORY,
			useClass: PrismaFornecedorRepository,
		},
	],
	exports: [FornecedorService, IFORNECEDOR_REPOSITORY],
})
export class FornecedorModule {}
