import { Injectable } from '@nestjs/common';
import type { AtualizarTabelaMontagemDto } from '../dtos/atualizar-tabela-montagem.dto';
import type { CriarTabelaMontagemDto } from '../dtos/criar-tabela-montagem.dto';
import type { TabelaMontagemResponseDto } from '../dtos/tabela-montagem-response.dto';
import { AtualizarTabelaMontagemUseCase } from '../use-cases/atualizar-tabela-montagem.use-case';
import { CriarTabelaMontagemUseCase } from '../use-cases/criar-tabela-montagem.use-case';
import { DeletarTabelaMontagemUseCase } from '../use-cases/deletar-tabela-montagem.use-case';
import { ListarTabelaMontagemUseCase } from '../use-cases/listar-tabela-montagem.use-case';

@Injectable()
export class TabelaMontagemService {
	public constructor(
		private readonly criarTabelaMontagemUseCase: CriarTabelaMontagemUseCase,
		private readonly listarTabelaMontagemUseCase: ListarTabelaMontagemUseCase,
		private readonly atualizarTabelaMontagemUseCase: AtualizarTabelaMontagemUseCase,
		private readonly deletarTabelaMontagemUseCase: DeletarTabelaMontagemUseCase,
	) {}

	public async criar(dto: CriarTabelaMontagemDto, usuarioId: number): Promise<TabelaMontagemResponseDto> {
		return this.criarTabelaMontagemUseCase.execute(dto, usuarioId);
	}

	public async listarPaginado(
		params: { page: number; limit: number; search?: string },
		usuarioId: number,
	): Promise<{ items: TabelaMontagemResponseDto[]; total: number }> {
		return this.listarTabelaMontagemUseCase.execute(params, usuarioId);
	}

	public async atualizar(
		id: number,
		dto: AtualizarTabelaMontagemDto,
		usuarioId: number,
	): Promise<TabelaMontagemResponseDto> {
		return this.atualizarTabelaMontagemUseCase.execute(id, dto, usuarioId);
	}

	public async deletar(id: number, usuarioId: number): Promise<void> {
		return this.deletarTabelaMontagemUseCase.execute(id, usuarioId);
	}
}
