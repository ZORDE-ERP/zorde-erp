import { Injectable } from '@nestjs/common';
import type { AtualizarFornecedorDto } from '../dtos/atualizar-fornecedor.dto';
import type { CriarFornecedorDto } from '../dtos/criar-fornecedor.dto';
import type { FornecedorResponseDto } from '../dtos/fornecedor-response.dto';
import { AtualizarFornecedorUseCase } from '../use-cases/atualizar-fornecedor.use-case';
import { BuscarFornecedorUseCase } from '../use-cases/buscar-fornecedor.use-case';
import { CriarFornecedorUseCase } from '../use-cases/criar-fornecedor.use-case';
import { DeletarFornecedorUseCase } from '../use-cases/deletar-fornecedor.use-case';
import { ListarFornecedoresUseCase } from '../use-cases/listar-fornecedores.use-case';

@Injectable()
export class FornecedorService {
	public constructor(
		private readonly criarFornecedorUseCase: CriarFornecedorUseCase,
		private readonly buscarFornecedorUseCase: BuscarFornecedorUseCase,
		private readonly listarFornecedoresUseCase: ListarFornecedoresUseCase,
		private readonly atualizarFornecedorUseCase: AtualizarFornecedorUseCase,
		private readonly deletarFornecedorUseCase: DeletarFornecedorUseCase,
	) {}

	public async criar(dto: CriarFornecedorDto, usuarioId: number): Promise<FornecedorResponseDto> {
		return this.criarFornecedorUseCase.execute(dto, usuarioId);
	}

	public async buscarPorId(id: number, usuarioId: number): Promise<FornecedorResponseDto> {
		return this.buscarFornecedorUseCase.execute(id, usuarioId);
	}

	public async listarPorUsuario(usuarioId: number): Promise<FornecedorResponseDto[]> {
		return this.listarFornecedoresUseCase.execute(usuarioId);
	}

	public async atualizar(id: number, dto: AtualizarFornecedorDto, usuarioId: number): Promise<FornecedorResponseDto> {
		return this.atualizarFornecedorUseCase.execute(id, dto, usuarioId);
	}

	public async deletar(id: number, usuarioId: number): Promise<void> {
		return this.deletarFornecedorUseCase.execute(id, usuarioId);
	}
}
