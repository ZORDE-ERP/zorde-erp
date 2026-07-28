import { Injectable } from '@nestjs/common';
import { AtualizarClienteDto, CriarClienteDto, ListClienteQueryDto } from '../dtos/cliente.dto';
import type { ClienteQrCodeResponseDto } from '../dtos/clienteQrCodeResponse.dto';
import type { ClienteResponseDto } from '../dtos/clienteResponse.dto';
import type { FolhaOsStatusResponseDto } from '../dtos/folhaOsStatus.dto';
import type { ImpressaoOsDto } from '../dtos/impressaoOs.dto';
import { AtualizarClienteUseCase } from '../use-cases/atualizarCliente.useCase';
import { BuscarClienteUseCase } from '../use-cases/buscarCliente.useCase';
import { BuscarStatusFolhaOsUseCase } from '../use-cases/buscarStatusFolhaOs.useCase';
import { CriarClienteUseCase } from '../use-cases/criarCliente.useCase';
import { DeletarClienteUseCase } from '../use-cases/deletarCliente.useCase';
import { GerarQrCodeClienteUseCase } from '../use-cases/gerarQrCodeCliente.useCase';
import type { ImprimirFolhasOsResult } from '../use-cases/imprimirFolhasOs.useCase';
import { ImprimirFolhasOsUseCase } from '../use-cases/imprimirFolhasOs.useCase';
import { ListarClientesUseCase, type ListClientesResult } from '../use-cases/listarClientes.useCase';
import type { TabelaMontagemPorQrItemDto } from '../use-cases/listarTabelaMontagemPorQr.useCase';
import { ListarTabelaMontagemPorQrUseCase } from '../use-cases/listarTabelaMontagemPorQr.useCase';
import { RemoverLogoClienteUseCase } from '../use-cases/removerLogoCliente.useCase';
import type { UploadLogoClienteInput } from '../use-cases/uploadLogoCliente.useCase';
import { UploadLogoClienteUseCase } from '../use-cases/uploadLogoCliente.useCase';

@Injectable()
export class ClienteService {
	public constructor(
		private readonly createClienteUseCase: CriarClienteUseCase,
		private readonly findByIdClienteUseCase: BuscarClienteUseCase,
		private readonly listarClientesUseCase: ListarClientesUseCase,
		private readonly updateClienteUseCase: AtualizarClienteUseCase,
		private readonly deleteClienteUseCase: DeletarClienteUseCase,
		private readonly gerarQrCodeClienteUseCase: GerarQrCodeClienteUseCase,
		private readonly listarTabelaMontagemPorQrUseCase: ListarTabelaMontagemPorQrUseCase,
		private readonly imprimirFolhasOsUseCase: ImprimirFolhasOsUseCase,
		private readonly uploadLogoClienteUseCase: UploadLogoClienteUseCase,
		private readonly removerLogoClienteUseCase: RemoverLogoClienteUseCase,
		private readonly buscarStatusFolhaOsUseCase: BuscarStatusFolhaOsUseCase,
	) {}

	public async create(dto: CriarClienteDto, usuarioId: number): Promise<ClienteResponseDto> {
		return this.createClienteUseCase.execute(dto, usuarioId);
	}

	public async findById(id: number, usuarioId: number): Promise<ClienteResponseDto> {
		return this.findByIdClienteUseCase.execute(id, usuarioId);
	}

	public async listar(query: ListClienteQueryDto, usuarioId: number): Promise<ListClientesResult> {
		return this.listarClientesUseCase.execute(query, usuarioId);
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

	public async imprimirFolhasOs(clienteId: number, usuarioId: number, dto: ImpressaoOsDto): Promise<ImprimirFolhasOsResult> {
		return this.imprimirFolhasOsUseCase.execute(clienteId, usuarioId, dto);
	}

	public async uploadLogo(clienteId: number, usuarioId: number, file: UploadLogoClienteInput): Promise<ClienteResponseDto> {
		return this.uploadLogoClienteUseCase.execute(clienteId, usuarioId, file);
	}

	public async removerLogo(clienteId: number, usuarioId: number): Promise<ClienteResponseDto> {
		return this.removerLogoClienteUseCase.execute(clienteId, usuarioId);
	}

	public async buscarStatusFolhaOs(
		codigoFolha: string,
		clienteId: number,
		usuarioId: number,
	): Promise<FolhaOsStatusResponseDto> {
		return this.buscarStatusFolhaOsUseCase.execute(codigoFolha, clienteId, usuarioId);
	}
}
