import { Inject, Injectable } from '@nestjs/common';
import type { ITabelaMontagemRepository } from '../../domain/repositories/i-tabela-montagem.repository';
import { I_TABELA_MONTAGEM_REPOSITORY } from '../../domain/repositories/i-tabela-montagem.repository';
import { TabelaMontagemResponseDto } from '../dtos/tabela-montagem-response.dto';

@Injectable()
export class ListarTabelaMontagemUseCase {
	public constructor(
		@Inject(I_TABELA_MONTAGEM_REPOSITORY)
		private readonly tabelaMontagemRepository: ITabelaMontagemRepository,
	) {}

	public async execute(
		params: { page: number; limit: number; search?: string },
		usuarioId: number,
	): Promise<{ items: TabelaMontagemResponseDto[]; total: number }> {
		const page = params.page > 0 ? params.page : 1;
		const limit = params.limit > 0 ? params.limit : 10;
		const search = params.search || '';

		const { items, total } = await this.tabelaMontagemRepository.listarPaginado({
			page,
			limit,
			search,
			usuarioId,
		});

		return {
			items: TabelaMontagemResponseDto.fromEntities(items),
			total,
		};
	}
}
