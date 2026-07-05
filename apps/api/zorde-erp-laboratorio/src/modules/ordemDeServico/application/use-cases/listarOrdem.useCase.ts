import { Inject, Injectable } from '@nestjs/common';
import type { IServiceOrderRepository } from '../../domain/repositories/ordemDeServico.repository';
import { ISERVICE_ORDER_REPOSITORY } from '../../domain/repositories/ordemDeServico.repository';
import type { ServiceOrderResponseDto } from '../dtos/ordemDeServicoResponse.dto';
import { serviceOrdersToResponse } from '../mappers/ordemDeServicoResponse.mapper';

@Injectable()
export class FindAllServiceOrdersUseCase {
	public constructor(
		@Inject(ISERVICE_ORDER_REPOSITORY)
		private readonly serviceOrderRepository: IServiceOrderRepository,
	) {}

	public async execute(usuarioId: number): Promise<ServiceOrderResponseDto[]> {
		const entities = await this.serviceOrderRepository.findByUsuarioId(usuarioId);
		return serviceOrdersToResponse(entities);
	}
}
