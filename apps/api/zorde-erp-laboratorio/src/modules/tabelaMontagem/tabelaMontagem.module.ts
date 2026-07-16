import { Module, forwardRef } from '@nestjs/common';
import { ClienteModule } from '../cliente/cliente.module';
import { ServicoModule } from '../servico/servico.module';
import { TabelaMontagemService } from './application/services/tabelaMontagem.service';
import { UpdateTabelaMontagemUseCase } from './application/use-cases/atualizarTabelaMontagem.useCase';
import { FindByIdTabelaMontagemUseCase } from './application/use-cases/buscarTabelaMontagem.useCase';
import { CreateTabelaMontagemUseCase } from './application/use-cases/criarTabelaMontagem.useCase';
import { DeleteTabelaMontagemUseCase } from './application/use-cases/deletarTabelaMontagem.useCase';
import { FindAllTabelaMontagemUseCase } from './application/use-cases/listarTabelaMontagem.useCase';
import { ITABELA_MONTAGEM_REPOSITORY } from './domain/repositories/tabelaMontagem.repository';
import { PrismaTabelaMontagemRepository } from './infrastructure/repositories/tabelaMontagemAdapter.repository';
import { TabelaMontagemController } from './presentation/controllers/tabelaMontagem.controller';

@Module({
	imports: [forwardRef(() => ClienteModule), ServicoModule],
	controllers: [TabelaMontagemController],
	providers: [
		CreateTabelaMontagemUseCase,
		FindByIdTabelaMontagemUseCase,
		FindAllTabelaMontagemUseCase,
		UpdateTabelaMontagemUseCase,
		DeleteTabelaMontagemUseCase,
		TabelaMontagemService,
		{
			provide: ITABELA_MONTAGEM_REPOSITORY,
			useClass: PrismaTabelaMontagemRepository,
		},
	],
	exports: [TabelaMontagemService, ITABELA_MONTAGEM_REPOSITORY],
})
export class TabelaMontagemModule {}
