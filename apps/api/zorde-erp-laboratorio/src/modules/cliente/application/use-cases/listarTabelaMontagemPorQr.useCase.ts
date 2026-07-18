import { Inject, Injectable } from '@nestjs/common';
import { ForbiddenException } from '../../../../shared/errors/app.exception';
import type { ITabelaMontagemRepository } from '../../../tabelaMontagem/domain/repositories/tabelaMontagem.repository';
import { ITABELA_MONTAGEM_REPOSITORY } from '../../../tabelaMontagem/domain/repositories/tabelaMontagem.repository';
import type { IClienteRepository } from '../../domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../domain/repositories/cliente.repository';

export interface TabelaMontagemPorQrItemDto {
	id: number;
	servicoId: number;
	nomeServico: string | null;
	valor: number;
}

@Injectable()
export class ListarTabelaMontagemPorQrUseCase {
	public constructor(
		@Inject(ICLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
		@Inject(ITABELA_MONTAGEM_REPOSITORY)
		private readonly tabelaMontagemRepository: ITabelaMontagemRepository,
	) {}

	public async execute(
		clienteId: number,
		token: string,
		usuarioId: number,
	): Promise<{ clienteId: number; itens: TabelaMontagemPorQrItemDto[] }> {
		const cliente = await this.clienteRepository.findById(clienteId, usuarioId);
		if (!cliente) {
			// Mesmo status do token inválido para não vazar existência de cliente de outro tenant
			throw new ForbiddenException('Token de QR Code inválido');
		}

		if (!cliente.getQrToken() || cliente.getQrToken() !== token) {
			throw new ForbiddenException('Token de QR Code inválido');
		}

		const tabelas = await this.tabelaMontagemRepository.findByClienteId(clienteId, usuarioId);

		return {
			clienteId,
			itens: tabelas.map((t) => ({
				id: t.getId() as number,
				servicoId: t.getServicoId(),
				nomeServico: t.getNomeServico(),
				valor: t.getValor(),
			})),
		};
	}
}
