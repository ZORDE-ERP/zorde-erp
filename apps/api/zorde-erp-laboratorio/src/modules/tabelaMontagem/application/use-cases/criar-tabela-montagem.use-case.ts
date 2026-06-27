import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IClienteRepository } from '../../../cliente/domain/repositories/i-cliente.repository';
import { I_CLIENTE_REPOSITORY } from '../../../cliente/domain/repositories/i-cliente.repository';
import { TabelaMontagemEntity } from '../../domain/entities/tabela-montagem.entity';
import type { ITabelaMontagemRepository } from '../../domain/repositories/i-tabela-montagem.repository';
import { I_TABELA_MONTAGEM_REPOSITORY } from '../../domain/repositories/i-tabela-montagem.repository';
import type { CriarTabelaMontagemDto } from '../dtos/criar-tabela-montagem.dto';
import { TabelaMontagemResponseDto } from '../dtos/tabela-montagem-response.dto';

@Injectable()
export class CriarTabelaMontagemUseCase {
	public constructor(
		@Inject(I_TABELA_MONTAGEM_REPOSITORY)
		private readonly tabelaMontagemRepository: ITabelaMontagemRepository,
		@Inject(I_CLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
	) {}

	public async execute(dto: CriarTabelaMontagemDto, usuarioId: number): Promise<TabelaMontagemResponseDto> {
		const cliente = await this.clienteRepository.buscarPorId(dto.clienteId);

		if (!cliente || cliente.deletedAt || cliente.usuarioId !== usuarioId) {
			throw new EntityNotFoundException('Cliente não encontrado');
		}

		const entity = TabelaMontagemEntity.create({
			clienteId: dto.clienteId,
			servico: dto.servico,
			valor: dto.valor,
		});

		const created = await this.tabelaMontagemRepository.criar(entity);
		created.nomeCliente = cliente.nome;

		return TabelaMontagemResponseDto.fromEntity(created);
	}
}
