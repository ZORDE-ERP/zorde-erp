import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { ITabelaMontagemRepository } from '../../domain/repositories/tabelaMontagem.repository';
import { ITABELA_MONTAGEM_REPOSITORY } from '../../domain/repositories/tabelaMontagem.repository';
import type { TabelaMontagemResponseDto } from '../dtos/tabelaMontagemResponse.dto';
import { tabelaMontagemToResponse } from '../mappers/tabelaMontagemResponse.mapper';

@Injectable()
export class FindByIdTabelaMontagemUseCase {
	public constructor(
		@Inject(ITABELA_MONTAGEM_REPOSITORY)
		private readonly tabelaMontagemRepository: ITabelaMontagemRepository,
	) {}

	public async execute(id: number, usuarioId: number): Promise<TabelaMontagemResponseDto> {
		const tabelaMontagem = await this.tabelaMontagemRepository.findById(id, usuarioId);

		if (!tabelaMontagem) {
			throw new EntityNotFoundException('Tabela de montagem não encontrada');
		}

		return tabelaMontagemToResponse(tabelaMontagem);
	}
}
