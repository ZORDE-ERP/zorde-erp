import { Injectable } from '@nestjs/common';
import type { CreateServicoDto, ListServicoQueryDto, UpdateServicoDto } from '../dtos/servico.dto';
import type { ServicoResponseDto } from '../dtos/servicoResponse.dto';
import { UpdateServicoUseCase } from '../use-cases/atualizarServico.useCase';
import { FindByIdServicoUseCase } from '../use-cases/buscarServico.useCase';
import { CreateServicoUseCase } from '../use-cases/criarServico.useCase';
import { DeleteServicoUseCase } from '../use-cases/deletarServico.useCase';
import { FindAllServicoUseCase } from '../use-cases/listarServico.useCase';

@Injectable()
export class ServicoService {
	public constructor(
		private readonly createServicoUseCase: CreateServicoUseCase,
		private readonly findByIdServicoUseCase: FindByIdServicoUseCase,
		private readonly findAllServicoUseCase: FindAllServicoUseCase,
		private readonly updateServicoUseCase: UpdateServicoUseCase,
		private readonly deleteServicoUseCase: DeleteServicoUseCase,
	) {}

	public async create(dto: CreateServicoDto, usuarioId: number): Promise<ServicoResponseDto> {
		return this.createServicoUseCase.execute(dto, usuarioId);
	}

	public async findById(id: number, usuarioId: number): Promise<ServicoResponseDto> {
		return this.findByIdServicoUseCase.execute(id, usuarioId);
	}

	public async findAllPaginated(
		query: ListServicoQueryDto,
		usuarioId: number,
	): Promise<{ items: ServicoResponseDto[]; total: number }> {
		return this.findAllServicoUseCase.execute(query, usuarioId);
	}

	public async update(id: number, dto: UpdateServicoDto, usuarioId: number): Promise<ServicoResponseDto> {
		return this.updateServicoUseCase.execute(id, dto, usuarioId);
	}

	public async delete(id: number, usuarioId: number): Promise<void> {
		return this.deleteServicoUseCase.execute(id, usuarioId);
	}
}
