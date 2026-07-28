import { Inject, Injectable } from '@nestjs/common';
import type { IFornecedorRepository } from '../../domain/repositories/fornecedor.repository';
import { IFORNECEDOR_REPOSITORY } from '../../domain/repositories/fornecedor.repository';
import type { ListFornecedorQueryDto } from '../dtos/fornecedor.dto';
import type { FornecedorResponseDto } from '../dtos/fornecedorResponse.dto';
import { fornecedoresToResponse } from '../mappers/fornecedorResponse.mapper';

export interface ListFornecedoresResult {
	items: FornecedorResponseDto[];
	total: number;
	counts: {
		total: number;
		ativos: number;
		inativos: number;
	};
}

@Injectable()
export class FindAllFornecedoresUseCase {
	public constructor(
		@Inject(IFORNECEDOR_REPOSITORY)
		private readonly fornecedorRepository: IFornecedorRepository,
	) {}

	public async execute(query: ListFornecedorQueryDto, usuarioId: number): Promise<ListFornecedoresResult> {
		const page = query.page > 0 ? query.page : 1;
		const limit = query.limit > 0 ? query.limit : 10;
		const search = query.search || '';

		const [{ items, total }, counts] = await Promise.all([
			this.fornecedorRepository.findAllPaginated({
				page,
				limit,
				search,
				status: query.status,
				usuarioId,
			}),
			this.fornecedorRepository.countByStatus(usuarioId),
		]);

		return {
			items: fornecedoresToResponse(items),
			total,
			counts,
		};
	}
}
