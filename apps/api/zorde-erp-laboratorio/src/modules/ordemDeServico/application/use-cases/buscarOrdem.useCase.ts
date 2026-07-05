import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IServiceOrderRepository } from '../../domain/repositories/ordemDeServico.repository';
import { ISERVICE_ORDER_REPOSITORY } from '../../domain/repositories/ordemDeServico.repository';
import type { ServiceOrderResponseDto } from '../dtos/ordemDeServicoResponse.dto';
import { serviceOrderToResponse } from '../mappers/ordemDeServicoResponse.mapper';

@Injectable()
export class FindByIdServiceOrderUseCase {
	public constructor(
		@Inject(ISERVICE_ORDER_REPOSITORY)
		private readonly serviceOrderRepository: IServiceOrderRepository,
	) {}

	public async execute(id: number, usuarioId: number): Promise<ServiceOrderResponseDto> {
		const entity = await this.serviceOrderRepository.findById(id, usuarioId);

		if (!entity) {
			throw new EntityNotFoundException('Ordem de serviço não encontrada');
		}

		return serviceOrderToResponse(entity);
	}
}
