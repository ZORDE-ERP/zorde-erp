import { Inject, Injectable } from '@nestjs/common';
import type { IServiceOrderRepository } from '../../domain/repositories/ordemDeServico.repository';
import { ISERVICE_ORDER_REPOSITORY } from '../../domain/repositories/ordemDeServico.repository';
import type { ListOrdersQueryDto } from '../dtos/ordemDeServico.dto';
import type { ServiceOrderResponseDto } from '../dtos/ordemDeServicoResponse.dto';
import { serviceOrdersToResponse } from '../mappers/ordemDeServicoResponse.mapper';

@Injectable()
export class FindAllServiceOrdersUseCase {
	public constructor(
		@Inject(ISERVICE_ORDER_REPOSITORY)
		private readonly serviceOrderRepository: IServiceOrderRepository,
	) {}

	public async execute(
		query: ListOrdersQueryDto,
		usuarioId: number,
	): Promise<{ items: ServiceOrderResponseDto[]; total: number }> {
		const { items, total } = await this.serviceOrderRepository.findAllPaginated({
			usuarioId,
			page: query.page,
			limit: query.limit,
			status: query.status,
			clienteId: query.clienteId,
			dataInicio: query.dataInicio,
			dataFim: query.dataFim,
		});

		return {
			items: serviceOrdersToResponse(items),
			total,
		};
	}
}
