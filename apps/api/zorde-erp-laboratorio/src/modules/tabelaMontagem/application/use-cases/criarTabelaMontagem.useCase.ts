import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IClienteRepository } from '../../../cliente/domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../../cliente/domain/repositories/cliente.repository';
import type { IServicoRepository } from '../../../servico/domain/repositories/servico.repository';
import { ISERVICO_REPOSITORY } from '../../../servico/domain/repositories/servico.repository';
import { TabelaMontagemEntity } from '../../domain/entities/tabelaMontagem.entity';
import type { ITabelaMontagemRepository } from '../../domain/repositories/tabelaMontagem.repository';
import { ITABELA_MONTAGEM_REPOSITORY } from '../../domain/repositories/tabelaMontagem.repository';
import type { CreateTabelaMontagemDto } from '../dtos/tabelaMontagem.dto';
import type { TabelaMontagemResponseDto } from '../dtos/tabelaMontagemResponse.dto';
import { tabelaMontagemToResponse } from '../mappers/tabelaMontagemResponse.mapper';

@Injectable()
export class CreateTabelaMontagemUseCase {
	public constructor(
		@Inject(ITABELA_MONTAGEM_REPOSITORY)
		private readonly tabelaMontagemRepository: ITabelaMontagemRepository,
		@Inject(ICLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
		@Inject(ISERVICO_REPOSITORY)
		private readonly servicoRepository: IServicoRepository,
	) {}

	public async execute(dto: CreateTabelaMontagemDto, usuarioId: number): Promise<TabelaMontagemResponseDto> {
		const cliente = await this.clienteRepository.findById(dto.clienteId, usuarioId);

		if (!cliente) {
			throw new EntityNotFoundException('Cliente não encontrado');
		}

		const servico = await this.servicoRepository.findById(dto.servicoId, usuarioId);

		if (!servico) {
			throw new EntityNotFoundException('Serviço não encontrado');
		}

		const entity = TabelaMontagemEntity.create({
			clienteId: dto.clienteId,
			servicoId: dto.servicoId,
			valor: dto.valor,
		});

		const created = await this.tabelaMontagemRepository.create(entity);
		created.setNomeCliente(cliente.getNome());
		created.setNomeServico(servico.getNome());

		return tabelaMontagemToResponse(created);
	}
}
