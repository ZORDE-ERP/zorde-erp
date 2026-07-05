import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IServiceOrderRepository } from '../../domain/repositories/ordemDeServico.repository';
import { ISERVICE_ORDER_REPOSITORY } from '../../domain/repositories/ordemDeServico.repository';

@Injectable()
export class DeleteServiceOrderUseCase {
	public constructor(
		@Inject(ISERVICE_ORDER_REPOSITORY)
		private readonly serviceOrderRepository: IServiceOrderRepository,
	) {}

	public async execute(id: number, usuarioId: number): Promise<void> {
		const entity = await this.serviceOrderRepository.findById(id, usuarioId);

		if (!entity) {
			throw new EntityNotFoundException('Ordem de serviço não encontrada');
		}

		await this.serviceOrderRepository.softDelete(id, usuarioId);
	}
}
