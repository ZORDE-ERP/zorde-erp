import { Injectable } from '@nestjs/common';
import type {
	CreateTabelaMontagemDto,
	ListTabelaMontagemQueryDto,
	UpdateTabelaMontagemDto,
} from '../dtos/tabelaMontagem.dto';
import type { TabelaMontagemResponseDto } from '../dtos/tabelaMontagemResponse.dto';
import { UpdateTabelaMontagemUseCase } from '../use-cases/atualizarTabelaMontagem.useCase';
import { FindByIdTabelaMontagemUseCase } from '../use-cases/buscarTabelaMontagem.useCase';
import { CreateTabelaMontagemUseCase } from '../use-cases/criarTabelaMontagem.useCase';
import { DeleteTabelaMontagemUseCase } from '../use-cases/deletarTabelaMontagem.useCase';
import { FindAllTabelaMontagemUseCase } from '../use-cases/listarTabelaMontagem.useCase';

@Injectable()
export class TabelaMontagemService {
	public constructor(
		private readonly createTabelaMontagemUseCase: CreateTabelaMontagemUseCase,
		private readonly findByIdTabelaMontagemUseCase: FindByIdTabelaMontagemUseCase,
		private readonly findAllTabelaMontagemUseCase: FindAllTabelaMontagemUseCase,
		private readonly updateTabelaMontagemUseCase: UpdateTabelaMontagemUseCase,
		private readonly deleteTabelaMontagemUseCase: DeleteTabelaMontagemUseCase,
	) {}

	public async create(dto: CreateTabelaMontagemDto, usuarioId: number): Promise<TabelaMontagemResponseDto> {
		return this.createTabelaMontagemUseCase.execute(dto, usuarioId);
	}

	public async findById(id: number, usuarioId: number): Promise<TabelaMontagemResponseDto> {
		return this.findByIdTabelaMontagemUseCase.execute(id, usuarioId);
	}

	public async findAllPaginated(
		query: ListTabelaMontagemQueryDto,
		usuarioId: number,
	): Promise<{ items: TabelaMontagemResponseDto[]; total: number }> {
		return this.findAllTabelaMontagemUseCase.execute(query, usuarioId);
	}

	public async update(id: number, dto: UpdateTabelaMontagemDto, usuarioId: number): Promise<TabelaMontagemResponseDto> {
		return this.updateTabelaMontagemUseCase.execute(id, dto, usuarioId);
	}

	public async delete(id: number, usuarioId: number): Promise<void> {
		return this.deleteTabelaMontagemUseCase.execute(id, usuarioId);
	}
}
