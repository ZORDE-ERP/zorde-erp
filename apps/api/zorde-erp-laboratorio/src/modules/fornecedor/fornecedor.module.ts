import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infra/database/database.module';
import { FornecedorService } from './application/services/fornecedor.service';
import { AtualizarFornecedorUseCase } from './application/use-cases/atualizar-fornecedor.use-case';
import { BuscarFornecedorUseCase } from './application/use-cases/buscar-fornecedor.use-case';
import { CriarFornecedorUseCase } from './application/use-cases/criar-fornecedor.use-case';
import { DeletarFornecedorUseCase } from './application/use-cases/deletar-fornecedor.use-case';
import { ListarFornecedoresUseCase } from './application/use-cases/listar-fornecedores.use-case';
import { I_FORNECEDOR_REPOSITORY } from './domain/repositories/i-fornecedor.repository';
import { PrismaFornecedorRepository } from './infrastructure/repositories/prisma-fornecedor.repository';
import { FornecedorController } from './presentation/controllers/fornecedor.controller';

@Module({
	imports: [DatabaseModule],
	controllers: [FornecedorController],
	providers: [
		CriarFornecedorUseCase,
		BuscarFornecedorUseCase,
		ListarFornecedoresUseCase,
		AtualizarFornecedorUseCase,
		DeletarFornecedorUseCase,
		FornecedorService,
		{
			provide: I_FORNECEDOR_REPOSITORY,
			useClass: PrismaFornecedorRepository,
		},
	],
	exports: [FornecedorService, I_FORNECEDOR_REPOSITORY],
})
export class FornecedorModule {}
