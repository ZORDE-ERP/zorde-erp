import { Module } from '@nestjs/common';
import { ServicoService } from './application/services/servico.service';
import { UpdateServicoUseCase } from './application/use-cases/atualizarServico.useCase';
import { FindByIdServicoUseCase } from './application/use-cases/buscarServico.useCase';
import { CreateServicoUseCase } from './application/use-cases/criarServico.useCase';
import { DeleteServicoUseCase } from './application/use-cases/deletarServico.useCase';
import { FindAllServicoUseCase } from './application/use-cases/listarServico.useCase';
import { ISERVICO_REPOSITORY } from './domain/repositories/servico.repository';
import { PrismaServicoRepository } from './infrastructure/repositories/servicoAdapter.repository';
import { ServicoController } from './presentation/controllers/servico.controller';

@Module({
	imports: [],
	controllers: [ServicoController],
	providers: [
		CreateServicoUseCase,
		FindByIdServicoUseCase,
		FindAllServicoUseCase,
		UpdateServicoUseCase,
		DeleteServicoUseCase,
		ServicoService,
		{
			provide: ISERVICO_REPOSITORY,
			useClass: PrismaServicoRepository,
		},
	],
	exports: [ServicoService, ISERVICO_REPOSITORY],
})
export class ServicoModule {}
