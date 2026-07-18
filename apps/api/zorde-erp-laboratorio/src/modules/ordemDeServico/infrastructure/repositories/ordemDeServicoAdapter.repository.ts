import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { StatusOrdemServico } from '../../../../shared/enums/ordem-de-servico.enum';
import { ServiceOrderEntity } from '../../domain/entities/ordemDeServico.entity';

import type {
	CreateServiceOrderData,
	FechamentoAggregateRow,
	FechamentoFilters,
	IServiceOrderRepository,
	ListServiceOrdersFilters,
} from '../../domain/repositories/ordemDeServico.repository';
import { ServiceOrderInfraMapper } from '../mappers/ordemDeServicoInfra.mapper';

const includeRelations = {
	Cliente: true,
	Itens: {
		include: {
			TabelaMontagem: {
				include: { Servico: true },
			},
		},
	},
} as const;

@Injectable()
export class PrismaServiceOrderRepository implements IServiceOrderRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async createWithItems(data: CreateServiceOrderData): Promise<ServiceOrderEntity> {
		const created = await this.prisma.$transaction(async (tx) => {
			const order = await tx.ordemDeServico.create({
				data: {
					codigoOS: data.codigoOs,
					clienteId: data.clienteId,
					usuarioId: data.usuarioId,
					valorTotal: data.valorTotal,
					status: data.status,
					origem: data.origem,
					observacao: data.observacao ?? null,
					createdAt: new Date(),
					Itens: {
						create: data.itens.map((item) => ({
							tabelaMontagemId: item.tabelaMontagemId ?? null,
							descricaoManual: item.descricaoManual ?? null,
							quantidade: item.quantidade,
							valorUnitario: item.valorUnitario,
							valorTotal: item.valorTotal,
							origemValor: item.origemValor as never,
						})),
					},
				},
				include: includeRelations,
			});

			if (data.folhaId != null) {
				await tx.folhaOsImpressa.update({
					where: { id: data.folhaId },
					data: {
						ordemDeServicoId: order.id,
						status: 'LANCADA',
					},
				});
			}

			return order;
		});

		return ServiceOrderInfraMapper.toDomain(created);
	}

	public async findById(id: number, usuarioId: number): Promise<ServiceOrderEntity | null> {
		const serviceOrderResult = await this.prisma.ordemDeServico.findFirst({
			where: {
				id,
				AND: [{ usuarioId }, { deletedAt: null }],
			},
			include: includeRelations,
		});
		if (!serviceOrderResult) return null;
		return ServiceOrderInfraMapper.toDomain(serviceOrderResult);
	}

	public async findByUsuarioId(usuarioId: number): Promise<ServiceOrderEntity[]> {
		const serviceOrderResults = await this.prisma.ordemDeServico.findMany({
			where: { usuarioId, deletedAt: null },
			include: includeRelations,
			orderBy: { id: 'desc' },
		});
		return serviceOrderResults.map(ServiceOrderInfraMapper.toDomain);
	}

	public async findAllPaginated(filters: ListServiceOrdersFilters): Promise<{ items: ServiceOrderEntity[]; total: number }> {
		const { usuarioId, page, limit, status, clienteId, dataInicio, dataFim } = filters;
		const skip = (page - 1) * limit;

		const where: Prisma.OrdemDeServicoWhereInput = {
			usuarioId,
			deletedAt: null,
			...(status ? { status } : {}),
			...(clienteId ? { clienteId } : {}),
			...(dataInicio || dataFim
				? {
						createdAt: {
							...(dataInicio ? { gte: dataInicio } : {}),
							...(dataFim ? { lte: dataFim } : {}),
						},
					}
				: {}),
		};

		const [items, total] = await Promise.all([
			this.prisma.ordemDeServico.findMany({
				where,
				skip,
				take: limit,
				include: includeRelations,
				orderBy: { id: 'desc' },
			}),
			this.prisma.ordemDeServico.count({ where }),
		]);

		return {
			items: items.map(ServiceOrderInfraMapper.toDomain),
			total,
		};
	}

	public async countByCliente(clienteId: number, usuarioId: number): Promise<number> {
		return this.prisma.ordemDeServico.count({
			where: { clienteId, usuarioId },
		});
	}

	public async update(serviceOrder: ServiceOrderEntity): Promise<ServiceOrderEntity> {
		const serviceOrderResult = await this.prisma.ordemDeServico.update({
			where: {
				id: serviceOrder.getId() as number,
				AND: { usuarioId: { equals: serviceOrder.getUsuarioId() } },
			},
			data: {
				codigoOS: serviceOrder.getCodigoOs(),
				observacao: serviceOrder.getObservacao(),
				status: serviceOrder.getStatus(),
				updatedAt: new Date(),
			},
			include: includeRelations,
		});
		return ServiceOrderInfraMapper.toDomain(serviceOrderResult);
	}

	public async softDelete(id: number, usuarioId: number): Promise<void> {
		await this.prisma.ordemDeServico.update({
			where: { id, AND: { usuarioId } },
			data: { deletedAt: new Date() },
		});
	}

	public async sumFechamento(filters: FechamentoFilters): Promise<FechamentoAggregateRow[]> {
		const groups = await this.prisma.ordemDeServico.groupBy({
			by: ['clienteId'],
			where: {
				usuarioId: filters.usuarioId,
				deletedAt: null,
				status: StatusOrdemServico.LANCADA,
				...(filters.clienteId ? { clienteId: filters.clienteId } : {}),
				createdAt: {
					gte: filters.dataInicio,
					lte: filters.dataFim,
				},
			},
			_sum: { valorTotal: true },
			_count: { _all: true },
		});

		if (groups.length === 0) return [];

		const clientes = await this.prisma.cliente.findMany({
			where: {
				id: { in: groups.map((g) => g.clienteId) },
				usuarioId: filters.usuarioId,
			},
			select: { id: true, nome: true },
		});
		const nomeById = new Map(clientes.map((c) => [c.id, c.nome]));

		return groups.map((g) => ({
			clienteId: g.clienteId,
			nomeCliente: nomeById.get(g.clienteId) ?? '',
			quantidadeOrdens: g._count._all,
			valorTotal: g._sum.valorTotal ?? 0,
		}));
	}

	public async faturarPorPeriodo(filters: FechamentoFilters & { clienteId: number }): Promise<number> {
		const result = await this.prisma.ordemDeServico.updateMany({
			where: {
				usuarioId: filters.usuarioId,
				clienteId: filters.clienteId,
				deletedAt: null,
				status: StatusOrdemServico.LANCADA,
				createdAt: {
					gte: filters.dataInicio,
					lte: filters.dataFim,
				},
			},
			data: {
				status: StatusOrdemServico.FATURADA,
				updatedAt: new Date(),
			},
		});
		return result.count;
	}
}
