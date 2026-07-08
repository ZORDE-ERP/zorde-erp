import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IClienteRepository } from '../../../cliente/domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../../cliente/domain/repositories/cliente.repository';
import type { IServicoRepository } from '../../../servico/domain/repositories/servico.repository';
import { ISERVICO_REPOSITORY } from '../../../servico/domain/repositories/servico.repository';
import { TabelaMontagemEntity } from '../../domain/entities/tabelaMontagem.entity';
import type { ITabelaMontagemRepository } from '../../domain/repositories/tabelaMontagem.repository';
import { ITABELA_MONTAGEM_REPOSITORY } from '../../domain/repositories/tabelaMontagem.repository';
import type { UpdateTabelaMontagemDto } from '../dtos/tabelaMontagem.dto';
import type { TabelaMontagemResponseDto } from '../dtos/tabelaMontagemResponse.dto';
import { tabelaMontagemToResponse } from '../mappers/tabelaMontagemResponse.mapper';

@Injectable()
export class UpdateTabelaMontagemUseCase {
	public constructor(
		@Inject(ITABELA_MONTAGEM_REPOSITORY)
		private readonly tabelaMontagemRepository: ITabelaMontagemRepository,
		@Inject(ICLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
		@Inject(ISERVICO_REPOSITORY)
		private readonly servicoRepository: IServicoRepository,
	) {}

	public async execute(id: number, dto: UpdateTabelaMontagemDto, usuarioId: number): Promise<TabelaMontagemResponseDto> {
		const existing = await this.tabelaMontagemRepository.findById(id, usuarioId);

		if (!existing) {
			throw new EntityNotFoundException('Tabela de montagem não encontrada');
		}

		const existingCliente = await this.clienteRepository.findById(existing.getClienteId(), usuarioId);
		if (!existingCliente) {
			throw new EntityNotFoundException('Tabela de montagem não encontrada');
		}

		let finalClienteId = existing.getClienteId();
		let finalClienteNome = existingCliente.getNome();

		if (dto.clienteId !== undefined && dto.clienteId !== existing.getClienteId()) {
			const newCliente = await this.clienteRepository.findById(dto.clienteId, usuarioId);
			if (!newCliente || newCliente.getDeletedAt()) {
				throw new EntityNotFoundException('Cliente não encontrado');
			}
			finalClienteId = dto.clienteId;
			finalClienteNome = newCliente.getNome();
		}

		let finalServicoId = existing.getServicoId();
		let finalServicoNome = existing.getNomeServico() ?? '';

		if (dto.servicoId !== undefined && dto.servicoId !== existing.getServicoId()) {
			const servico = await this.servicoRepository.findById(dto.servicoId, usuarioId);
			if (!servico) {
				throw new EntityNotFoundException('Serviço não encontrado');
			}
			finalServicoId = dto.servicoId;
			finalServicoNome = servico.getNome();
		}

		const tabelaMontagem = new TabelaMontagemEntity({
			id: existing.getId(),
			clienteId: finalClienteId,
			servicoId: finalServicoId,
			valor: dto.valor ?? existing.getValor(),
			createdAt: existing.getCreatedAt(),
			updatedAt: new Date(),
			deletedAt: existing.getDeletedAt(),
		});

		const updated = await this.tabelaMontagemRepository.update(tabelaMontagem);
		updated.setNomeCliente(finalClienteNome);
		updated.setNomeServico(finalServicoNome);

		return tabelaMontagemToResponse(updated);
	}
}
