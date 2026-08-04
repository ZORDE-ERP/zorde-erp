import { forwardRef, Module } from '@nestjs/common';
import { EnderecoAdapterRepository } from 'src/shared/infra/persistence/enderecoAdapter.repository';
import { LogoImageService } from 'src/shared/infra/services/logoImage.service';
import { ReservarCodigosOsService } from 'src/shared/infra/services/reservarCodigosOs.service';
import { TabelaMontagemModule } from '../tabelaMontagem/tabelaMontagem.module';
import { ClienteService } from './application/services/cliente.service';
import { AtualizarClienteUseCase } from './application/use-cases/atualizarCliente.useCase';
import { BuscarClienteUseCase } from './application/use-cases/buscarCliente.useCase';
import { BuscarStatusFolhaOsUseCase } from './application/use-cases/buscarStatusFolhaOs.useCase';
import { CriarClienteUseCase } from './application/use-cases/criarCliente.useCase';
import { DeletarClienteUseCase } from './application/use-cases/deletarCliente.useCase';
import { GerarQrCodeClienteUseCase } from './application/use-cases/gerarQrCodeCliente.useCase';
import { ImprimirFolhasOsUseCase } from './application/use-cases/imprimirFolhasOs.useCase';
import { ListarClientesUseCase } from './application/use-cases/listarClientes.useCase';
import { ListarTabelaMontagemPorQrUseCase } from './application/use-cases/listarTabelaMontagemPorQr.useCase';
import { RemoverLogoClienteUseCase } from './application/use-cases/removerLogoCliente.useCase';
import { UploadLogoClienteUseCase } from './application/use-cases/uploadLogoCliente.useCase';
import { ICLIENTE_REPOSITORY } from './domain/repositories/cliente.repository';
import { IFOLHA_OS_REPOSITORY } from './domain/repositories/folhaOs.repository';
import { PrismaClienteRepository } from './infrastructure/repositories/clienteAdapter.repository';
import { PrismaFolhaOsRepository } from './infrastructure/repositories/folhaOsAdapter.repository';
import { OsFolhaPdfService } from './infrastructure/services/osFolhaPdf.service';
import { QrCodeImageService } from './infrastructure/services/qrCodeImage.service';
import { ClienteController } from './presentation/controllers/cliente.controller';
import { FolhaOsController } from './presentation/controllers/folhaOs.controller';

@Module({
	imports: [forwardRef(() => TabelaMontagemModule)],
	controllers: [ClienteController, FolhaOsController],
	providers: [
		EnderecoAdapterRepository,
		QrCodeImageService,
		LogoImageService,
		ReservarCodigosOsService,
		OsFolhaPdfService,
		CriarClienteUseCase,
		BuscarClienteUseCase,
		ListarClientesUseCase,
		AtualizarClienteUseCase,
		DeletarClienteUseCase,
		GerarQrCodeClienteUseCase,
		ListarTabelaMontagemPorQrUseCase,
		ImprimirFolhasOsUseCase,
		UploadLogoClienteUseCase,
		RemoverLogoClienteUseCase,
		BuscarStatusFolhaOsUseCase,
		ClienteService,
		{
			provide: ICLIENTE_REPOSITORY,
			useClass: PrismaClienteRepository,
		},
		{
			provide: IFOLHA_OS_REPOSITORY,
			useClass: PrismaFolhaOsRepository,
		},
	],
	exports: [ClienteService, ICLIENTE_REPOSITORY, IFOLHA_OS_REPOSITORY, ReservarCodigosOsService],
})
export class ClienteModule {}
