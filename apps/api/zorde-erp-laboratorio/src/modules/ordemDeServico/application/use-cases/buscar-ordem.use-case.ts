import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IOrdemDeServicoRepository } from '../../domain/repositories/i-ordem-de-servico.repository';
import { I_ORDEM_DE_SERVICO_REPOSITORY } from '../../domain/repositories/i-ordem-de-servico.repository';
import { OrdemDeServicoResponseDto } from '../dtos/ordem-de-servico-response.dto';

@Injectable()
export class BuscarOrdemUseCase {
	public constructor(
		@Inject(I_ORDEM_DE_SERVICO_REPOSITORY)
		private readonly ordemDeServicoRepository: IOrdemDeServicoRepository,
	) {}

	public async execute(id: number, usuarioId: number): Promise<OrdemDeServicoResponseDto> {
		const existing = await this.ordemDeServicoRepository.buscarPorId(id);

		if (!existing || existing.deletedAt || existing.usuarioId !== usuarioId) {
			throw new EntityNotFoundException('Ordem de serviço não encontrada');
		}

		return OrdemDeServicoResponseDto.fromEntity(existing);
	}
}
