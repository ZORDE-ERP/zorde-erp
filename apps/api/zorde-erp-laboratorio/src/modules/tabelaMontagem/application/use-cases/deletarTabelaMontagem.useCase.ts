import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { ITabelaMontagemRepository } from '../../domain/repositories/tabelaMontagem.repository';
import { ITABELA_MONTAGEM_REPOSITORY } from '../../domain/repositories/tabelaMontagem.repository';

@Injectable()
export class DeleteTabelaMontagemUseCase {
	public constructor(
		@Inject(ITABELA_MONTAGEM_REPOSITORY)
		private readonly tabelaMontagemRepository: ITabelaMontagemRepository,
	) {}

	public async execute(id: number, usuarioId: number): Promise<void> {
		const existing = await this.tabelaMontagemRepository.findById(id, usuarioId);

		if (!existing) {
			throw new EntityNotFoundException('Tabela de montagem não encontrada');
		}

		await this.tabelaMontagemRepository.deleteById(id, usuarioId);
	}
}
