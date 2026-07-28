import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { StatusFolhaOs } from '../../../../shared/enums/folha-os.enum';
import { OrigemOrdemServico, OrigemValorItem, StatusOrdemServico } from '../../../../shared/enums/ordem-de-servico.enum';
import { BusinessRuleException, ConflictException, EntityNotFoundException } from '../../../../shared/errors/app.exception';
import { ReservarCodigosOsService } from '../../../../shared/infra/services/reservarCodigosOs.service';
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
		private readonly reservarCodigosOsService: ReservarCodigosOsService,
	) {}

	public async execute(data: CreateOrderDto, usuarioId: number): Promise<ServiceOrderResponseDto> {
		const cliente = await this.clienteRepository.findById(data.clienteId, usuarioId);
		if (!cliente) {
			throw new EntityNotFoundException('Cliente não encontrado');
		}

		if (data.origem === OrigemOrdemServico.QR_SCAN && !data.codigoFolha) {
			throw new BusinessRuleException('codigoFolha é obrigatório para lançamento via QR');
		}

		let folhaId: number | null = null;
		let codigoOsFromFolha: string | null = null;

		if (data.folhaId != null || data.codigoFolha) {
			const folha =
				data.folhaId != null
					? await this.folhaOsRepository.findById(data.folhaId, usuarioId)
					: await this.folhaOsRepository.findByCodigoFolha(data.codigoFolha as string, usuarioId);

			if (!folha || folha.getClienteId() !== data.clienteId) {
				throw new BusinessRuleException('Não existe este código impresso para este cliente');
			}
			if (folha.getStatus() !== StatusFolhaOs.IMPRESSA) {
				throw new ConflictException('Esta OS impressa já foi lançada');
			}
			folhaId = folha.getId() as number;
			codigoOsFromFolha = folha.getCodigoFolha();
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

		let codigoOs: string;
		if (codigoOsFromFolha) {
			codigoOs = codigoOsFromFolha;
		} else {
			const reservados = await this.reservarCodigosOsService.reservar(data.clienteId, usuarioId, 1);
			codigoOs = reservados[0];
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
				throw new ConflictException('Esta OS impressa já foi lançada');
			}
			throw error;
		}
	}
}
