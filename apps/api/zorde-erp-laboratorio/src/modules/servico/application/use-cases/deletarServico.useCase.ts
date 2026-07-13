import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IServicoRepository } from '../../domain/repositories/servico.repository';
import { ISERVICO_REPOSITORY } from '../../domain/repositories/servico.repository';

@Injectable()
export class DeleteServicoUseCase {
	public constructor(
		@Inject(ISERVICO_REPOSITORY)
		private readonly servicoRepository: IServicoRepository,
	) {}

	public async execute(id: number, usuarioId: number): Promise<void> {
		const existing = await this.servicoRepository.findById(id, usuarioId);

		if (!existing) {
			throw new EntityNotFoundException('Serviço não encontrado');
		}

		await this.servicoRepository.delete(id, usuarioId);
	}
}
