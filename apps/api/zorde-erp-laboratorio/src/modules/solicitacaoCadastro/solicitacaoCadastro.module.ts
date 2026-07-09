import { Module } from '@nestjs/common';
import { UsuarioModule } from '../usuario/usuario.module';
import { ReenviarCodigoUseCase } from './application/use-cases/reenviarCodigo.useCase';
import { SolicitarCadastroUseCase } from './application/use-cases/solicitarCadastro.useCase';
import { VerificarEmailUseCase } from './application/use-cases/verificarEmail.useCase';
import { ISOLICITACAO_CADASTRO_REPOSITORY } from './domain/repositories/solicitacaoCadastro.repository';
import { PrismaSolicitacaoCadastroRepository } from './infrastructure/repositories/solicitacaoCadastroAdapter.repository';
import { ResendEmailService } from './infrastructure/services/resendEmail.service';
import { SolicitacaoCadastroController } from './presentation/controllers/solicitacaoCadastro.controller';

@Module({
	imports: [UsuarioModule],
	controllers: [SolicitacaoCadastroController],
	providers: [
		ResendEmailService,
		SolicitarCadastroUseCase,
		VerificarEmailUseCase,
		ReenviarCodigoUseCase,
		{
			provide: ISOLICITACAO_CADASTRO_REPOSITORY,
			useClass: PrismaSolicitacaoCadastroRepository,
		},
	],
	exports: [ISOLICITACAO_CADASTRO_REPOSITORY, SolicitarCadastroUseCase, VerificarEmailUseCase, ReenviarCodigoUseCase],
})
export class SolicitacaoCadastroModule {}
