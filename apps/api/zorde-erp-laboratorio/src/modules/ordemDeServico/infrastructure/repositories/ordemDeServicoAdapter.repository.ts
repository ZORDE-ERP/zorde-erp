import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { ServiceOrderEntity } from '../../domain/entities/ordemDeServico.entity';
import type { IServiceOrderRepository } from '../../domain/repositories/ordemDeServico.repository';
import { ServiceOrderInfraMapper } from '../mappers/ordemDeServicoInfra.mapper';

const includeRelations = { Cliente: true, TabelaMontagem: { include: { Servico: true } } } as const;

@Injectable()
export class PrismaServiceOrderRepository implements IServiceOrderRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async create(serviceOrder: ServiceOrderEntity): Promise<ServiceOrderEntity> {
		const persistenceData = ServiceOrderInfraMapper.toPersistence(serviceOrder);
		const serviceOrderResult = await this.prisma.ordemDeServico.create({
			data: {
				codigoOS: persistenceData.codigoOS,
				clienteId: persistenceData.clienteId,
				valor: +Number(persistenceData.valor).toFixed(2),
				tabelaMontagemId: persistenceData.tabelaMontagemId,
				usuarioId: persistenceData.usuarioId as number,
				createdAt: persistenceData.createdAt || new Date(),
			},
			include: includeRelations,
		});
		return ServiceOrderInfraMapper.toDomain(serviceOrderResult);
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

	public async update(serviceOrder: ServiceOrderEntity): Promise<ServiceOrderEntity> {
		const persistenceData = ServiceOrderInfraMapper.toPersistence(serviceOrder);
		const serviceOrderResult = await this.prisma.ordemDeServico.update({
			where: {
				id: serviceOrder.getId() as number,
				AND: { usuarioId: { equals: serviceOrder.getUsuarioId() } },
			},
			data: persistenceData as Prisma.OrdemDeServicoUncheckedUpdateInput,
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
}
