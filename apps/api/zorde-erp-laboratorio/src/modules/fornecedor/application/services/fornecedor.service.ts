import { Injectable } from '@nestjs/common';
import { CreateFornecedorDto, UpdateFornecedorDto } from '../dtos/fornecedor.dto';
import type { FornecedorResponseDto } from '../dtos/fornecedorResponse.dto';
import { UpdateFornecedorUseCase } from '../use-cases/atualizarFornecedor.useCase';
import { FindByIdFornecedorUseCase } from '../use-cases/buscarFornecedor.useCase';
import { CreateFornecedorUseCase } from '../use-cases/criarFornecedor.useCase';
import { DeleteFornecedorUseCase } from '../use-cases/deletarFornecedor.useCase';
import { FindAllFornecedoresUseCase } from '../use-cases/listarFornecedores.useCase';

@Injectable()
export class FornecedorService {
	public constructor(
		private readonly createFornecedorUseCase: CreateFornecedorUseCase,
		private readonly findByIdFornecedorUseCase: FindByIdFornecedorUseCase,
		private readonly findAllFornecedoresUseCase: FindAllFornecedoresUseCase,
		private readonly updateFornecedorUseCase: UpdateFornecedorUseCase,
		private readonly deleteFornecedorUseCase: DeleteFornecedorUseCase,
	) {}

	public async create(dto: CreateFornecedorDto, usuarioId: number): Promise<FornecedorResponseDto> {
		return this.createFornecedorUseCase.execute(dto, usuarioId);
	}

	public async findById(id: number, usuarioId: number): Promise<FornecedorResponseDto> {
		return this.findByIdFornecedorUseCase.execute(id, usuarioId);
	}

	public async findByUsuarioId(usuarioId: number): Promise<FornecedorResponseDto[]> {
		return this.findAllFornecedoresUseCase.execute(usuarioId);
	}

	public async update(dto: UpdateFornecedorDto, usuarioId: number): Promise<FornecedorResponseDto> {
		return this.updateFornecedorUseCase.execute(dto, usuarioId);
	}

	public async delete(id: number, usuarioId: number): Promise<void> {
		return this.deleteFornecedorUseCase.execute(id, usuarioId);
	}
}
