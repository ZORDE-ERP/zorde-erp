import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infra/database/database.module';
import { ClienteModule } from '../cliente/cliente.module';
import { TabelaMontagemController } from './presentation/controllers/tabela-montagem.controller';
import { TabelaMontagemService } from './application/services/tabela-montagem.service';
import { CriarTabelaMontagemUseCase } from './application/use-cases/criar-tabela-montagem.use-case';
import { ListarTabelaMontagemUseCase } from './application/use-cases/listar-tabela-montagem.use-case';
import { AtualizarTabelaMontagemUseCase } from './application/use-cases/atualizar-tabela-montagem.use-case';
import { DeletarTabelaMontagemUseCase } from './application/use-cases/deletar-tabela-montagem.use-case';
import { I_TABELA_MONTAGEM_REPOSITORY } from './domain/repositories/i-tabela-montagem.repository';
import { PrismaTabelaMontagemRepository } from './infrastructure/repositories/prisma-tabela-montagem.repository';

@Module({
  imports: [DatabaseModule, ClienteModule],
  controllers: [TabelaMontagemController],
  providers: [
    CriarTabelaMontagemUseCase,
    ListarTabelaMontagemUseCase,
    AtualizarTabelaMontagemUseCase,
    DeletarTabelaMontagemUseCase,
    TabelaMontagemService,
    {
      provide: I_TABELA_MONTAGEM_REPOSITORY,
      useClass: PrismaTabelaMontagemRepository,
    },
  ],
  exports: [
    TabelaMontagemService,
    I_TABELA_MONTAGEM_REPOSITORY,
  ],
})
export class TabelaMontagemModule {}
