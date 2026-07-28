import { Inject, Injectable } from '@nestjs/common';
import type { IClienteRepository } from '../../domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../domain/repositories/cliente.repository';
import type { ListClienteQueryDto } from '../dtos/cliente.dto';
import type { ClienteResponseDto } from '../dtos/clienteResponse.dto';
import { clientesToResponse } from '../mappers/clienteResponse.mapper';

export interface ListClientesResult {
	items: ClienteResponseDto[];
	total: number;
	counts: {
		total: number;
		ativos: number;
		inativos: number;
	};
}

@Injectable()
export class ListarClientesUseCase {
	public constructor(
		@Inject(ICLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
	) {}

	public async execute(query: ListClienteQueryDto, usuarioId: number): Promise<ListClientesResult> {
		const page = query.page > 0 ? query.page : 1;
		const limit = query.limit > 0 ? query.limit : 10;
		const search = query.search || '';

		const [{ items, total }, counts] = await Promise.all([
			this.clienteRepository.findAllPaginated({
				page,
				limit,
				search,
				status: query.status,
				id: query.id,
				usuarioId,
			}),
			this.clienteRepository.countByStatus(usuarioId),
		]);

		return {
			items: clientesToResponse(items),
			total,
			counts,
		};
	}
}
