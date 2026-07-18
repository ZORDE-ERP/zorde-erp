import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
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
		const existing = await this.serviceOrderRepository.findById(data.id, usuarioId);
		if (!existing) {
			throw new EntityNotFoundException('Ordem de serviço não encontrada');
		}

		const updatedEntity = new ServiceOrderEntity({
			id: existing.getId(),
			codigoOs: data.codigoOS ?? existing.getCodigoOs(),
			clienteId: existing.getClienteId(),
			usuarioId,
			valorTotal: existing.getValorTotal(),
			status: data.status ?? existing.getStatus(),
			origem: existing.getOrigem(),
			observacao: data.observacao === undefined ? existing.getObservacao() : data.observacao,
			createdAt: existing.getCreatedAt(),
			itens: existing.getItens(),
			cliente: existing.getCliente() ?? undefined,
		});

		const updatedServiceOrder = await this.serviceOrderRepository.update(updatedEntity);
		return serviceOrderToResponse(updatedServiceOrder);
	}
}
