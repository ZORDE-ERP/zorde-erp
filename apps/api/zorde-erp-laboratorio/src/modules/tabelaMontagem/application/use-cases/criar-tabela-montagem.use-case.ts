import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IClienteRepository } from '../../../cliente/domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../../cliente/domain/repositories/cliente.repository';
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
		@Inject(ICLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
	) {}

	public async execute(dto: CriarTabelaMontagemDto, usuarioId: number): Promise<TabelaMontagemResponseDto> {
		const cliente = await this.clienteRepository.findById(dto.clienteId, usuarioId);

		if (!cliente) {
			throw new EntityNotFoundException('Cliente não encontrado');
		}

		const entity = TabelaMontagemEntity.create({
			clienteId: dto.clienteId,
			servico: dto.servico,
			valor: dto.valor,
		});

		const created = await this.tabelaMontagemRepository.criar(entity);
		created.nomeCliente = cliente.getNome();

		return TabelaMontagemResponseDto.fromEntity(created);
	}
}
