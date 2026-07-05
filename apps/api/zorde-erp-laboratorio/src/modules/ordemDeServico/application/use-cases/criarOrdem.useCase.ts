import { Inject, Injectable } from '@nestjs/common';
import { ServiceOrderEntity } from '../../domain/entities/ordemDeServico.entity';
import type { IServiceOrderRepository } from '../../domain/repositories/ordemDeServico.repository';
import { ISERVICE_ORDER_REPOSITORY } from '../../domain/repositories/ordemDeServico.repository';
import type { CreateOrderDto } from '../dtos/ordemDeServico.dto';
import type { ServiceOrderResponseDto } from '../dtos/ordemDeServicoResponse.dto';
import { serviceOrderToResponse } from '../mappers/ordemDeServicoResponse.mapper';

@Injectable()
export class CreateServiceOrderUseCase {
	public constructor(
		@Inject(ISERVICE_ORDER_REPOSITORY)
		private readonly serviceOrderRepository: IServiceOrderRepository,
	) {}

	public async execute(data: CreateOrderDto, usuarioId: number): Promise<ServiceOrderResponseDto> {
		const entity = new ServiceOrderEntity({
			codigoOs: data.codigoOs,
			clienteId: data.clienteId,
			valor: data.valor,
			tabelaMontagemId: data.tabelaMontagemId,
			usuarioId,
			createdAt: new Date(),
		});

		const serviceOrderResult = await this.serviceOrderRepository.create(entity);

		return serviceOrderToResponse(serviceOrderResult);
	}
}
