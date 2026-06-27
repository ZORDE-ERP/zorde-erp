import { Injectable } from '@nestjs/common';
import type { AtualizarOrdemDto } from '../dtos/atualizar-ordem.dto';
import type { CriarOrdemDto } from '../dtos/criar-ordem.dto';
import type { OrdemDeServicoResponseDto } from '../dtos/ordem-de-servico-response.dto';
import { AtualizarOrdemUseCase } from '../use-cases/atualizar-ordem.use-case';
import { BuscarOrdemUseCase } from '../use-cases/buscar-ordem.use-case';
import { CriarOrdemUseCase } from '../use-cases/criar-ordem.use-case';
import { DeletarOrdemUseCase } from '../use-cases/deletar-ordem.use-case';
import { ListarOrdemUseCase } from '../use-cases/listar-ordem.use-case';

@Injectable()
export class OrdemDeServicoService {
	public constructor(
		private readonly criarOrdemUseCase: CriarOrdemUseCase,
		private readonly buscarOrdemUseCase: BuscarOrdemUseCase,
		private readonly listarOrdemUseCase: ListarOrdemUseCase,
		private readonly atualizarOrdemUseCase: AtualizarOrdemUseCase,
		private readonly deletarOrdemUseCase: DeletarOrdemUseCase,
	) {}

	public async criar(dto: CriarOrdemDto, usuarioId: number): Promise<OrdemDeServicoResponseDto> {
		return this.criarOrdemUseCase.execute(dto, usuarioId);
	}

	public async buscarPorId(id: number, usuarioId: number): Promise<OrdemDeServicoResponseDto> {
		return this.buscarOrdemUseCase.execute(id, usuarioId);
	}

	public async listarPorUsuario(usuarioId: number): Promise<OrdemDeServicoResponseDto[]> {
		return this.listarOrdemUseCase.execute(usuarioId);
	}

	public async atualizar(id: number, dto: AtualizarOrdemDto, usuarioId: number): Promise<OrdemDeServicoResponseDto> {
		return this.atualizarOrdemUseCase.execute(id, dto, usuarioId);
	}

	public async deletar(id: number, usuarioId: number): Promise<void> {
		return this.deletarOrdemUseCase.execute(id, usuarioId);
	}
}
