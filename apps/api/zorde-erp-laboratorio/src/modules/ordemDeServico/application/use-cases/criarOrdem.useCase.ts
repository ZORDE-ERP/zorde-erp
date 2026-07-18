import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { StatusFolhaOs } from '../../../../shared/enums/folha-os.enum';
import { OrigemValorItem, StatusOrdemServico } from '../../../../shared/enums/ordem-de-servico.enum';
import { BusinessRuleException, ConflictException, EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IClienteRepository } from '../../../cliente/domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../../cliente/domain/repositories/cliente.repository';
import type { IFolhaOsRepository } from '../../../cliente/domain/repositories/folhaOs.repository';
import { IFOLHA_OS_REPOSITORY } from '../../../cliente/domain/repositories/folhaOs.repository';
import type { ITabelaMontagemRepository } from '../../../tabelaMontagem/domain/repositories/tabelaMontagem.repository';
import { ITABELA_MONTAGEM_REPOSITORY } from '../../../tabelaMontagem/domain/repositories/tabelaMontagem.repository';
import type { IServiceOrderRepository } from '../../domain/repositories/ordemDeServico.repository';
import { ISERVICE_ORDER_REPOSITORY } from '../../domain/repositories/ordemDeServico.repository';
import type { CreateOrderDto } from '../dtos/ordemDeServico.dto';
import type { ServiceOrderResponseDto } from '../dtos/ordemDeServicoResponse.dto';
import { serviceOrderToResponse } from '../mappers/ordemDeServicoResponse.mapper';

@Injectable()
export class CreateServiceOrderUseCase {
	public constructor(
		@Inject(ISERVICE_ORDER_REPOSITORY)
		private readonly serviceOrderRepository: IServiceOrderRepository,
		@Inject(ICLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
		@Inject(ITABELA_MONTAGEM_REPOSITORY)
		private readonly tabelaMontagemRepository: ITabelaMontagemRepository,
		@Inject(IFOLHA_OS_REPOSITORY)
		private readonly folhaOsRepository: IFolhaOsRepository,
	) {}

	public async execute(data: CreateOrderDto, usuarioId: number): Promise<ServiceOrderResponseDto> {
		const cliente = await this.clienteRepository.findById(data.clienteId, usuarioId);
		if (!cliente) {
			throw new EntityNotFoundException('Cliente não encontrado');
		}

		let folhaId: number | null = null;
		if (data.folhaId != null || data.codigoFolha) {
			const folha =
				data.folhaId != null
					? await this.folhaOsRepository.findById(data.folhaId, usuarioId)
					: await this.folhaOsRepository.findByCodigoFolha(data.codigoFolha as string, usuarioId);

			if (!folha) {
				throw new EntityNotFoundException('Folha de OS não encontrada');
			}
			if (folha.getClienteId() !== data.clienteId) {
				throw new BusinessRuleException('Folha não pertence ao cliente da OS');
			}
			if (folha.getStatus() !== StatusFolhaOs.IMPRESSA) {
				throw new ConflictException('Folha já foi lançada ou cancelada');
			}
			folhaId = folha.getId() as number;
		}

		const tabelaIds = [...new Set(data.itens.map((item) => item.tabelaMontagemId).filter((id): id is number => id != null))];

		const tabelas = await this.tabelaMontagemRepository.findByIds(tabelaIds, usuarioId);
		const tabelaById = new Map(tabelas.map((t) => [t.getId() as number, t]));

		for (const tabelaId of tabelaIds) {
			const tabela = tabelaById.get(tabelaId);
			if (!tabela) {
				throw new BusinessRuleException(`Tabela de montagem ${tabelaId} não encontrada`);
			}
			if (tabela.getClienteId() !== data.clienteId) {
				throw new BusinessRuleException(`Tabela de montagem ${tabelaId} não pertence ao cliente da OS`);
			}
		}

		const itensResolvidos = data.itens.map((item) => {
			let valorUnitario = Number(item.valorUnitario);
			const descricaoManual = item.descricaoManual ?? null;

			/**
			 * Decisão: quando origemValor=TABELA, o backend sempre usa o valor vigente
			 * do banco (ignora valorUnitario do payload) — mais resiliente a frontend desatualizado.
			 * Quando origemValor=MANUAL, usa o valor enviado.
			 */
			if (item.origemValor === OrigemValorItem.TABELA) {
				if (item.tabelaMontagemId == null) {
					throw new BusinessRuleException('origemValor TABELA exige tabelaMontagemId');
				}
				const tabela = tabelaById.get(item.tabelaMontagemId);
				if (!tabela) {
					throw new BusinessRuleException(`Tabela de montagem ${item.tabelaMontagemId} não encontrada`);
				}
				valorUnitario = tabela.getValor();
			}

			const quantidade = item.quantidade;
			const valorTotal = Number((quantidade * valorUnitario).toFixed(2));

			return {
				tabelaMontagemId: item.tabelaMontagemId ?? null,
				descricaoManual,
				quantidade,
				valorUnitario: Number(valorUnitario.toFixed(2)),
				valorTotal,
				origemValor: item.origemValor,
			};
		});

		const valorTotalOs = Number(itensResolvidos.reduce((acc, item) => acc + item.valorTotal, 0).toFixed(2));

		let codigoOs = data.codigoOS;
		if (!codigoOs) {
			const count = await this.serviceOrderRepository.countByCliente(data.clienteId, usuarioId);
			codigoOs = `OS-${data.clienteId}-${String(count + 1).padStart(5, '0')}`;
		}

		try {
			const created = await this.serviceOrderRepository.createWithItems({
				codigoOs,
				clienteId: data.clienteId,
				usuarioId,
				valorTotal: valorTotalOs,
				status: StatusOrdemServico.LANCADA,
				origem: data.origem,
				observacao: data.observacao ?? null,
				folhaId,
				itens: itensResolvidos,
			});

			return serviceOrderToResponse(created);
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				throw new ConflictException('Já existe uma forma de vínculo/código duplicado para esta OS');
			}
			throw error;
		}
	}
}
