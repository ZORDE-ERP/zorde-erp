import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IOrdemDeServicoRepository } from '../../domain/repositories/i-ordem-de-servico.repository';
import { I_ORDEM_DE_SERVICO_REPOSITORY } from '../../domain/repositories/i-ordem-de-servico.repository';

@Injectable()
export class DeletarOrdemUseCase {
	public constructor(
		@Inject(I_ORDEM_DE_SERVICO_REPOSITORY)
		private readonly ordemDeServicoRepository: IOrdemDeServicoRepository,
	) {}

	public async execute(id: number, usuarioId: number): Promise<void> {
		const existing = await this.ordemDeServicoRepository.buscarPorId(id);

		if (!existing || existing.deletedAt || existing.usuarioId !== usuarioId) {
			throw new EntityNotFoundException('Ordem de serviço não encontrada');
		}

		await this.ordemDeServicoRepository.deletarSoft(id);
	}
}
