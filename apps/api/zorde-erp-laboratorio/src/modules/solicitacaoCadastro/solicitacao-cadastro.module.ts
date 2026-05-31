import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infra/database/database.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { SolicitacaoCadastroController } from './presentation/controllers/solicitacao-cadastro.controller';
import { SolicitarCadastroUseCase } from './application/use-cases/solicitar-cadastro.use-case';
import { VerificarEmailUseCase } from './application/use-cases/verificar-email.use-case';
import { ReenviarCodigoUseCase } from './application/use-cases/reenviar-codigo.use-case';
import { I_SOLICITACAO_CADASTRO_REPOSITORY } from './domain/repositories/i-solicitacao-cadastro.repository';
import { PrismaSolicitacaoCadastroRepository } from './infrastructure/repositories/prisma-solicitacao-cadastro.repository';
import { ResendEmailService } from './infrastructure/services/resend-email.service';

@Module({
  imports: [
    DatabaseModule,
    UsuarioModule,
  ],
  controllers: [SolicitacaoCadastroController],
  providers: [
    SolicitarCadastroUseCase,
    VerificarEmailUseCase,
    ReenviarCodigoUseCase,
    ResendEmailService,
    {
      provide: I_SOLICITACAO_CADASTRO_REPOSITORY,
      useClass: PrismaSolicitacaoCadastroRepository,
    },
  ],
  exports: [
    I_SOLICITACAO_CADASTRO_REPOSITORY,
    SolicitarCadastroUseCase,
    VerificarEmailUseCase,
    ReenviarCodigoUseCase,
  ],
})
export class SolicitacaoCadastroModule {}
