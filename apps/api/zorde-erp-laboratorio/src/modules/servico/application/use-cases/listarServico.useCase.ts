import { Inject, Injectable } from '@nestjs/common';
import type { IServicoRepository } from '../../domain/repositories/servico.repository';
import { ISERVICO_REPOSITORY } from '../../domain/repositories/servico.repository';
import type { ServicoResponseDto } from '../dtos/servicoResponse.dto';
import { servicosToResponse } from '../mappers/servicoResponse.mapper';

@Injectable()
export class FindAllServicoUseCase {
	public constructor(
		@Inject(ISERVICO_REPOSITORY)
		private readonly servicoRepository: IServicoRepository,
	) {}

	public async execute(
		params: { page: number; limit: number; search?: string },
		usuarioId: number,
	): Promise<{ items: ServicoResponseDto[]; total: number }> {
		const page = params.page > 0 ? params.page : 1;
		const limit = params.limit > 0 ? params.limit : 10;
		const search = params.search || '';

		const { items, total } = await this.servicoRepository.findAllPaginated({
			page,
			limit,
			search,
			usuarioId,
		});

		return {
			items: servicosToResponse(items),
			total,
		};
	}
}
