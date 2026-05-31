import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infra/database/database.module';
import { ClienteModule } from '../cliente/cliente.module';
import { TabelaMontagemModule } from '../tabelaMontagem/tabela-montagem.module';
import { AuthModule } from '../auth/auth.module';
import { OrdemDeServicoController } from './presentation/controllers/ordem-de-servico.controller';
import { OrdemDeServicoService } from './application/services/ordem-de-servico.service';
import { CriarOrdemUseCase } from './application/use-cases/criar-ordem.use-case';
import { BuscarOrdemUseCase } from './application/use-cases/buscar-ordem.use-case';
import { ListarOrdemUseCase } from './application/use-cases/listar-ordem.use-case';
import { AtualizarOrdemUseCase } from './application/use-cases/atualizar-ordem.use-case';
import { DeletarOrdemUseCase } from './application/use-cases/deletar-ordem.use-case';
import { I_ORDEM_DE_SERVICO_REPOSITORY } from './domain/repositories/i-ordem-de-servico.repository';
import { PrismaOrdemDeServicoRepository } from './infrastructure/repositories/prisma-ordem-de-servico.repository';

@Module({
  imports: [
    DatabaseModule,
    ClienteModule,
    TabelaMontagemModule,
    AuthModule,
  ],
  controllers: [OrdemDeServicoController],
  providers: [
    CriarOrdemUseCase,
    BuscarOrdemUseCase,
    ListarOrdemUseCase,
    AtualizarOrdemUseCase,
    DeletarOrdemUseCase,
    OrdemDeServicoService,
    {
      provide: I_ORDEM_DE_SERVICO_REPOSITORY,
      useClass: PrismaOrdemDeServicoRepository,
    },
  ],
  exports: [
    OrdemDeServicoService,
    I_ORDEM_DE_SERVICO_REPOSITORY,
  ],
})
export class OrdemDeServicoModule {}
