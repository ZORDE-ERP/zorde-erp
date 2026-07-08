import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import { ServicoEntity } from '../../domain/entities/servico.entity';
import type { IServicoRepository } from '../../domain/repositories/servico.repository';
import { ISERVICO_REPOSITORY } from '../../domain/repositories/servico.repository';
import type { UpdateServicoDto } from '../dtos/servico.dto';
import type { ServicoResponseDto } from '../dtos/servicoResponse.dto';
import { servicoToResponse } from '../mappers/servicoResponse.mapper';

@Injectable()
export class UpdateServicoUseCase {
	public constructor(
		@Inject(ISERVICO_REPOSITORY)
		private readonly servicoRepository: IServicoRepository,
	) {}

	public async execute(id: number, dto: UpdateServicoDto, usuarioId: number): Promise<ServicoResponseDto> {
		const existing = await this.servicoRepository.findById(id, usuarioId);

		if (!existing) {
			throw new EntityNotFoundException('Serviço não encontrado');
		}

		const servico = new ServicoEntity({
			id: existing.getId(),
			usuarioId,
			nome: dto.nome ?? existing.getNome(),
			descricao: dto.descricao !== undefined ? dto.descricao : existing.getDescricao(),
			createdAt: existing.getCreatedAt(),
			updatedAt: new Date(),
		});

		const updated = await this.servicoRepository.update(servico);

		return servicoToResponse(updated);
	}
}
