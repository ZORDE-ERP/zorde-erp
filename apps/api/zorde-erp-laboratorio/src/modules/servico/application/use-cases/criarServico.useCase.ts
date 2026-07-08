import { Inject, Injectable } from '@nestjs/common';
import { ServicoEntity } from '../../domain/entities/servico.entity';
import type { IServicoRepository } from '../../domain/repositories/servico.repository';
import { ISERVICO_REPOSITORY } from '../../domain/repositories/servico.repository';
import type { CreateServicoDto } from '../dtos/servico.dto';
import type { ServicoResponseDto } from '../dtos/servicoResponse.dto';
import { servicoToResponse } from '../mappers/servicoResponse.mapper';

@Injectable()
export class CreateServicoUseCase {
	public constructor(
		@Inject(ISERVICO_REPOSITORY)
		private readonly servicoRepository: IServicoRepository,
	) {}

	public async execute(dto: CreateServicoDto, usuarioId: number): Promise<ServicoResponseDto> {
		const entity = new ServicoEntity({
			usuarioId,
			nome: dto.nome,
			descricao: dto.descricao ?? null,
		});

		const created = await this.servicoRepository.create(entity);

		return servicoToResponse(created);
	}
}
