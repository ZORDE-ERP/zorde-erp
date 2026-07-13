import { Inject, Injectable } from '@nestjs/common';
import type { ITabelaMontagemRepository } from '../../domain/repositories/tabelaMontagem.repository';
import { ITABELA_MONTAGEM_REPOSITORY } from '../../domain/repositories/tabelaMontagem.repository';
import type { TabelaMontagemResponseDto } from '../dtos/tabelaMontagemResponse.dto';
import { tabelaMontagensToResponse } from '../mappers/tabelaMontagemResponse.mapper';

@Injectable()
export class FindAllTabelaMontagemUseCase {
	public constructor(
		@Inject(ITABELA_MONTAGEM_REPOSITORY)
		private readonly tabelaMontagemRepository: ITabelaMontagemRepository,
	) {}

	public async execute(
		params: { page: number; limit: number; search?: string },
		usuarioId: number,
	): Promise<{ items: TabelaMontagemResponseDto[]; total: number }> {
		const page = params.page > 0 ? params.page : 1;
		const limit = params.limit > 0 ? params.limit : 10;
		const search = params.search || '';

		const { items, total } = await this.tabelaMontagemRepository.findAllPaginated({
			page,
			limit,
			search,
			usuarioId,
		});

		return {
			items: tabelaMontagensToResponse(items),
			total,
		};
	}
}
