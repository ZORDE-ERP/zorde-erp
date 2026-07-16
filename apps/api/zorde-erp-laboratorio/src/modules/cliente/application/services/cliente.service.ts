import { Injectable } from '@nestjs/common';
import { AtualizarClienteDto, CriarClienteDto } from '../dtos/cliente.dto';
import type { ClienteQrCodeResponseDto } from '../dtos/clienteQrCodeResponse.dto';
import type { ClienteResponseDto } from '../dtos/clienteResponse.dto';
import { AtualizarClienteUseCase } from '../use-cases/atualizarCliente.useCase';
import { BuscarClienteUseCase } from '../use-cases/buscarCliente.useCase';
import { CriarClienteUseCase } from '../use-cases/criarCliente.useCase';
import { DeletarClienteUseCase } from '../use-cases/deletarCliente.useCase';
import { GerarQrCodeClienteUseCase } from '../use-cases/gerarQrCodeCliente.useCase';
import { ListarClientesUseCase } from '../use-cases/listarClientes.useCase';
import type { TabelaMontagemPorQrItemDto } from '../use-cases/listarTabelaMontagemPorQr.useCase';
import { ListarTabelaMontagemPorQrUseCase } from '../use-cases/listarTabelaMontagemPorQr.useCase';

@Injectable()
export class ClienteService {
	public constructor(
		private readonly createClienteUseCase: CriarClienteUseCase,
		private readonly findByIdClienteUseCase: BuscarClienteUseCase,
		private readonly findByUsuarioIdClienteUseCase: ListarClientesUseCase,
		private readonly updateClienteUseCase: AtualizarClienteUseCase,
		private readonly deleteClienteUseCase: DeletarClienteUseCase,
		private readonly gerarQrCodeClienteUseCase: GerarQrCodeClienteUseCase,
		private readonly listarTabelaMontagemPorQrUseCase: ListarTabelaMontagemPorQrUseCase,
	) {}

	public async create(dto: CriarClienteDto, usuarioId: number): Promise<ClienteResponseDto> {
		return this.createClienteUseCase.execute(dto, usuarioId);
	}

	public async findById(id: number, usuarioId: number): Promise<ClienteResponseDto> {
		return this.findByIdClienteUseCase.execute(id, usuarioId);
	}

	public async findByUsuarioId(usuarioId: number): Promise<ClienteResponseDto[]> {
		return this.findByUsuarioIdClienteUseCase.execute(usuarioId);
	}

	public async update(clienteDto: AtualizarClienteDto, usuarioId: number): Promise<ClienteResponseDto> {
		return this.updateClienteUseCase.execute(clienteDto, usuarioId);
	}

	public async delete(id: number, usuarioId: number): Promise<void> {
		return this.deleteClienteUseCase.execute(id, usuarioId);
	}

	public async gerarQrCode(clienteId: number, usuarioId: number): Promise<ClienteQrCodeResponseDto> {
		return this.gerarQrCodeClienteUseCase.execute(clienteId, usuarioId);
	}

	public async listarTabelaMontagemPorQr(
		clienteId: number,
		token: string,
		usuarioId: number,
	): Promise<{ clienteId: number; itens: TabelaMontagemPorQrItemDto[] }> {
		return this.listarTabelaMontagemPorQrUseCase.execute(clienteId, token, usuarioId);
	}
}
