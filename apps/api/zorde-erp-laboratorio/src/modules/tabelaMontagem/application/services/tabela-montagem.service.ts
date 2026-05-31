import { Injectable } from '@nestjs/common';
import { CriarTabelaMontagemUseCase } from '../use-cases/criar-tabela-montagem.use-case';
import { ListarTabelaMontagemUseCase } from '../use-cases/listar-tabela-montagem.use-case';
import { AtualizarTabelaMontagemUseCase } from '../use-cases/atualizar-tabela-montagem.use-case';
import { DeletarTabelaMontagemUseCase } from '../use-cases/deletar-tabela-montagem.use-case';
import { CriarTabelaMontagemDto } from '../dtos/criar-tabela-montagem.dto';
import { AtualizarTabelaMontagemDto } from '../dtos/atualizar-tabela-montagem.dto';
import { TabelaMontagemResponseDto } from '../dtos/tabela-montagem-response.dto';

@Injectable()
export class TabelaMontagemService {
  constructor(
    private readonly criarTabelaMontagemUseCase: CriarTabelaMontagemUseCase,
    private readonly listarTabelaMontagemUseCase: ListarTabelaMontagemUseCase,
    private readonly atualizarTabelaMontagemUseCase: AtualizarTabelaMontagemUseCase,
    private readonly deletarTabelaMontagemUseCase: DeletarTabelaMontagemUseCase,
  ) {}

  async criar(dto: CriarTabelaMontagemDto, usuarioId: number): Promise<TabelaMontagemResponseDto> {
    return this.criarTabelaMontagemUseCase.execute(dto, usuarioId);
  }

  async listarPaginado(
    params: { page: number; limit: number; search?: string },
    usuarioId: number,
  ): Promise<{ items: TabelaMontagemResponseDto[]; total: number }> {
    return this.listarTabelaMontagemUseCase.execute(params, usuarioId);
  }

  async atualizar(
    id: number,
    dto: AtualizarTabelaMontagemDto,
    usuarioId: number,
  ): Promise<TabelaMontagemResponseDto> {
    return this.atualizarTabelaMontagemUseCase.execute(id, dto, usuarioId);
  }

  async deletar(id: number, usuarioId: number): Promise<void> {
    return this.deletarTabelaMontagemUseCase.execute(id, usuarioId);
  }
}
