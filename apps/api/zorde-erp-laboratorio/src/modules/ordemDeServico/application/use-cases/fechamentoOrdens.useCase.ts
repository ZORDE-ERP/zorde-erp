import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IClienteRepository } from '../../../cliente/domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../../cliente/domain/repositories/cliente.repository';
import type { IServiceOrderRepository } from '../../domain/repositories/ordemDeServico.repository';
import { ISERVICE_ORDER_REPOSITORY } from '../../domain/repositories/ordemDeServico.repository';
import type { FechamentoQueryDto } from '../dtos/ordemDeServico.dto';
import type { FechamentoResponseDto } from '../dtos/ordemDeServicoResponse.dto';

@Injectable()
export class FechamentoOrdensUseCase {
	public constructor(
		@Inject(ISERVICE_ORDER_REPOSITORY)
		private readonly serviceOrderRepository: IServiceOrderRepository,
		@Inject(ICLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
	) {}

	public async execute(query: FechamentoQueryDto, usuarioId: number): Promise<FechamentoResponseDto> {
		if (query.clienteId) {
			const cliente = await this.clienteRepository.findById(query.clienteId, usuarioId);
			if (!cliente) {
				throw new EntityNotFoundException('Cliente não encontrado');
			}
		}

		const clientes = await this.serviceOrderRepository.sumFechamento({
			usuarioId,
			clienteId: query.clienteId,
			dataInicio: query.dataInicio,
			dataFim: query.dataFim,
		});

		const valorTotalGeral = Number(clientes.reduce((acc, row) => acc + row.valorTotal, 0).toFixed(2));

		return {
			dataInicio: query.dataInicio,
			dataFim: query.dataFim,
			clientes,
			valorTotalGeral,
		};
	}
}
