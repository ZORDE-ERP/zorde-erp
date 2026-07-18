import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IClienteRepository } from '../../../cliente/domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../../cliente/domain/repositories/cliente.repository';
import type { IServiceOrderRepository } from '../../domain/repositories/ordemDeServico.repository';
import { ISERVICE_ORDER_REPOSITORY } from '../../domain/repositories/ordemDeServico.repository';
import type { FaturarOrdensDto } from '../dtos/ordemDeServico.dto';
import type { FaturarOrdensResponseDto } from '../dtos/ordemDeServicoResponse.dto';

@Injectable()
export class FaturarOrdensUseCase {
	public constructor(
		@Inject(ISERVICE_ORDER_REPOSITORY)
		private readonly serviceOrderRepository: IServiceOrderRepository,
		@Inject(ICLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
	) {}

	public async execute(dto: FaturarOrdensDto, usuarioId: number): Promise<FaturarOrdensResponseDto> {
		const cliente = await this.clienteRepository.findById(dto.clienteId, usuarioId);
		if (!cliente) {
			throw new EntityNotFoundException('Cliente não encontrado');
		}

		const quantidadeAtualizada = await this.serviceOrderRepository.faturarPorPeriodo({
			usuarioId,
			clienteId: dto.clienteId,
			dataInicio: dto.dataInicio,
			dataFim: dto.dataFim,
		});

		return { quantidadeAtualizada };
	}
}
