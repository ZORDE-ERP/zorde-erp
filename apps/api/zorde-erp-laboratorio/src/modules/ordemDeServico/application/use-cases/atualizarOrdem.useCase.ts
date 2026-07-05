import { Inject, Injectable } from '@nestjs/common';
import { ServiceOrderEntity } from '../../domain/entities/ordemDeServico.entity';
import type { IServiceOrderRepository } from '../../domain/repositories/ordemDeServico.repository';
import { ISERVICE_ORDER_REPOSITORY } from '../../domain/repositories/ordemDeServico.repository';
import type { UpdateOrderDto } from '../dtos/ordemDeServico.dto';
import type { ServiceOrderResponseDto } from '../dtos/ordemDeServicoResponse.dto';
import { serviceOrderToResponse } from '../mappers/ordemDeServicoResponse.mapper';

@Injectable()
export class UpdateServiceOrderUseCase {
	public constructor(
		@Inject(ISERVICE_ORDER_REPOSITORY)
		private readonly serviceOrderRepository: IServiceOrderRepository,
	) {}

	public async execute(data: UpdateOrderDto, usuarioId: number): Promise<ServiceOrderResponseDto> {
		const updatedEntity = new ServiceOrderEntity({
			id: data.id,
			codigoOs: data.codigoOs,
			clienteId: data.clienteId,
			valor: data.valor.toFixed(2),
			tabelaMontagemId: data.tabelaMontagemId,
			usuarioId,
		});

		const updatedServiceOrder = await this.serviceOrderRepository.update(updatedEntity);

		return serviceOrderToResponse(updatedServiceOrder);
	}
}
