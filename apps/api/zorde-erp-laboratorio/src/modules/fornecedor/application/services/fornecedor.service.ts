import { Injectable } from '@nestjs/common';
import { CreateFornecedorDto, ListFornecedorQueryDto, UpdateFornecedorDto } from '../dtos/fornecedor.dto';
import type { FornecedorResponseDto } from '../dtos/fornecedorResponse.dto';
import { UpdateFornecedorUseCase } from '../use-cases/atualizarFornecedor.useCase';
import { FindByIdFornecedorUseCase } from '../use-cases/buscarFornecedor.useCase';
import { CreateFornecedorUseCase } from '../use-cases/criarFornecedor.useCase';
import { DeleteFornecedorUseCase } from '../use-cases/deletarFornecedor.useCase';
import { FindAllFornecedoresUseCase, type ListFornecedoresResult } from '../use-cases/listarFornecedores.useCase';
import { RemoverLogoFornecedorUseCase } from '../use-cases/removerLogoFornecedor.useCase';
import type { UploadLogoFornecedorInput } from '../use-cases/uploadLogoFornecedor.useCase';
import { UploadLogoFornecedorUseCase } from '../use-cases/uploadLogoFornecedor.useCase';

@Injectable()
export class FornecedorService {
	public constructor(
		private readonly createFornecedorUseCase: CreateFornecedorUseCase,
		private readonly findByIdFornecedorUseCase: FindByIdFornecedorUseCase,
		private readonly findAllFornecedoresUseCase: FindAllFornecedoresUseCase,
		private readonly updateFornecedorUseCase: UpdateFornecedorUseCase,
		private readonly deleteFornecedorUseCase: DeleteFornecedorUseCase,
		private readonly uploadLogoFornecedorUseCase: UploadLogoFornecedorUseCase,
		private readonly removerLogoFornecedorUseCase: RemoverLogoFornecedorUseCase,
	) {}

	public async create(dto: CreateFornecedorDto, usuarioId: number): Promise<FornecedorResponseDto> {
		return this.createFornecedorUseCase.execute(dto, usuarioId);
	}

	public async findById(id: number, usuarioId: number): Promise<FornecedorResponseDto> {
		return this.findByIdFornecedorUseCase.execute(id, usuarioId);
	}

	public async listar(query: ListFornecedorQueryDto, usuarioId: number): Promise<ListFornecedoresResult> {
		return this.findAllFornecedoresUseCase.execute(query, usuarioId);
	}

	public async update(dto: UpdateFornecedorDto, usuarioId: number): Promise<FornecedorResponseDto> {
		return this.updateFornecedorUseCase.execute(dto, usuarioId);
	}

	public async delete(id: number, usuarioId: number): Promise<void> {
		return this.deleteFornecedorUseCase.execute(id, usuarioId);
	}

	public async uploadLogo(
		fornecedorId: number,
		usuarioId: number,
		file: UploadLogoFornecedorInput,
	): Promise<FornecedorResponseDto> {
		return this.uploadLogoFornecedorUseCase.execute(fornecedorId, usuarioId, file);
	}

	public async removerLogo(fornecedorId: number, usuarioId: number): Promise<FornecedorResponseDto> {
		return this.removerLogoFornecedorUseCase.execute(fornecedorId, usuarioId);
	}
}
