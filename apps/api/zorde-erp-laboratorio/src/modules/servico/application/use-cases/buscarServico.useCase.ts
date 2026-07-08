import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IServicoRepository } from '../../domain/repositories/servico.repository';
import { ISERVICO_REPOSITORY } from '../../domain/repositories/servico.repository';
import type { ServicoResponseDto } from '../dtos/servicoResponse.dto';
import { servicoToResponse } from '../mappers/servicoResponse.mapper';

@Injectable()
export class FindByIdServicoUseCase {
	public constructor(
		@Inject(ISERVICO_REPOSITORY)
		private readonly servicoRepository: IServicoRepository,
	) {}

	public async execute(id: number, usuarioId: number): Promise<ServicoResponseDto> {
		const servico = await this.servicoRepository.findById(id, usuarioId);

		if (!servico) {
			throw new EntityNotFoundException('Serviço não encontrado');
		}

		return servicoToResponse(servico);
	}
}
