import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleException, EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IClienteRepository } from '../../../cliente/domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../../cliente/domain/repositories/cliente.repository';
import type { TabelaMontagemEntity } from '../../../tabelaMontagem/domain/entities/tabela-montagem.entity';
import type { ITabelaMontagemRepository } from '../../../tabelaMontagem/domain/repositories/i-tabela-montagem.repository';
import { I_TABELA_MONTAGEM_REPOSITORY } from '../../../tabelaMontagem/domain/repositories/i-tabela-montagem.repository';
import { OrdemDeServicoEntity } from '../../domain/entities/ordem-de-servico.entity';
import type { IOrdemDeServicoRepository } from '../../domain/repositories/i-ordem-de-servico.repository';
import { I_ORDEM_DE_SERVICO_REPOSITORY } from '../../domain/repositories/i-ordem-de-servico.repository';
import type { CriarOrdemDto } from '../dtos/criar-ordem.dto';
import { OrdemDeServicoResponseDto } from '../dtos/ordem-de-servico-response.dto';

@Injectable()
export class CriarOrdemUseCase {
	public constructor(
		@Inject(I_ORDEM_DE_SERVICO_REPOSITORY)
		private readonly ordemDeServicoRepository: IOrdemDeServicoRepository,
		@Inject(ICLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
		@Inject(I_TABELA_MONTAGEM_REPOSITORY)
		private readonly tabelaMontagemRepository: ITabelaMontagemRepository,
	) {}

	public async execute(dto: CriarOrdemDto, usuarioId: number): Promise<OrdemDeServicoResponseDto> {
		const cliente = await this.clienteRepository.findById(dto.clienteId, usuarioId);

		if (!cliente) {
			throw new EntityNotFoundException('Cliente não encontrado');
		}

		let tabelaMontagem: TabelaMontagemEntity | null = null;
		if (dto.tabelaMontagemId !== undefined && dto.tabelaMontagemId !== null) {
			tabelaMontagem = await this.tabelaMontagemRepository.buscarPorId(dto.tabelaMontagemId);
			if (!tabelaMontagem || tabelaMontagem.deletedAt) {
				throw new EntityNotFoundException('Tabela de montagem não encontrada');
			}

			if (tabelaMontagem.clienteId !== dto.clienteId) {
				throw new BusinessRuleException('A tabela de montagem selecionada não pertence ao cliente informado');
			}
		}

		const entity = OrdemDeServicoEntity.create({
			codigoOs: dto.codigoOs,
			clienteId: dto.clienteId,
			valor: dto.valor || (tabelaMontagem ? tabelaMontagem.valor : undefined),
			tabelaMontagemId: dto.tabelaMontagemId,
			usuarioId,
		});

		const created = await this.ordemDeServicoRepository.criar(entity);
		created.cliente = cliente;
		created.tabelaMontagem = tabelaMontagem || undefined;

		return OrdemDeServicoResponseDto.fromEntity(created);
	}
}
