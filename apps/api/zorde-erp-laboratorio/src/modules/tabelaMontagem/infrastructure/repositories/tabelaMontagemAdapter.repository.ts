import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { TabelaMontagemEntity } from '../../domain/entities/tabelaMontagem.entity';
import { ITabelaMontagemRepository } from '../../domain/repositories/tabelaMontagem.repository';
import { TabelaMontagemInfraMapper } from '../mappers/tabelaMontagemInfra.mapper';

const includeRelations = { Cliente: true, Servico: true } as const;

@Injectable()
export class PrismaTabelaMontagemRepository implements ITabelaMontagemRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async create(tabela: TabelaMontagemEntity): Promise<TabelaMontagemEntity> {
		const data = TabelaMontagemInfraMapper.toPersistence(tabela);
		const created = await this.prisma.tabelaMontagem.create({
			data,
			include: includeRelations,
		});
		return TabelaMontagemInfraMapper.toDomain(created);
	}

	public async findById(id: number, usuarioId: number): Promise<TabelaMontagemEntity | null> {
		const raw = await this.prisma.tabelaMontagem.findFirst({
			where: {
				id,
				deletedAt: null,
				Cliente: {
					usuarioId,
					deletedAt: null,
				},
			},
			include: includeRelations,
		});

		if (!raw) return null;

		return TabelaMontagemInfraMapper.toDomain(raw);
	}

	public async findByClienteId(clienteId: number, usuarioId: number): Promise<TabelaMontagemEntity[]> {
		const items = await this.prisma.tabelaMontagem.findMany({
			where: {
				clienteId,
				deletedAt: null,
				Cliente: {
					usuarioId,
					deletedAt: null,
				},
			},
			include: includeRelations,
			orderBy: { id: 'asc' },
		});

		return items.map(TabelaMontagemInfraMapper.toDomain);
	}

	public async findByIds(ids: number[], usuarioId: number): Promise<TabelaMontagemEntity[]> {
		if (ids.length === 0) return [];

		const items = await this.prisma.tabelaMontagem.findMany({
			where: {
				id: { in: ids },
				deletedAt: null,
				Cliente: {
					usuarioId,
					deletedAt: null,
				},
			},
			include: includeRelations,
		});

		return items.map(TabelaMontagemInfraMapper.toDomain);
	}

	public async findAllPaginated(params: {
		page: number;
		limit: number;
		search?: string;
		clienteId?: number;
		usuarioId: number;
	}): Promise<{ items: TabelaMontagemEntity[]; total: number }> {
		const { page, limit, search, clienteId, usuarioId } = params;
		const skip = (page - 1) * limit;
		const take = limit;

		const where: Record<string, unknown> = {
			deletedAt: null,
			Cliente: {
				usuarioId,
				deletedAt: null,
			},
		};

		if (clienteId != null) {
			where.clienteId = clienteId;
		}

		if (search) {
			where.OR = [
				{
					Servico: {
						nome: {
							contains: search,
							mode: 'insensitive',
						},
					},
				},
				{
					Cliente: {
						nome: {
							contains: search,
							mode: 'insensitive',
						},
					},
				},
			];
		}

		const [items, total] = await Promise.all([
			this.prisma.tabelaMontagem.findMany({
				where,
				skip,
				take,
				include: includeRelations,
				orderBy: { id: 'desc' },
			}),
			this.prisma.tabelaMontagem.count({ where }),
		]);

		return {
			items: items.map(TabelaMontagemInfraMapper.toDomain),
			total,
		};
	}

	public async update(tabela: TabelaMontagemEntity): Promise<TabelaMontagemEntity> {
		const updated = await this.prisma.tabelaMontagem.update({
			where: { id: tabela.getId() as number },
			data: {
				clienteId: tabela.getClienteId(),
				servicoId: tabela.getServicoId(),
				valor: tabela.getValor(),
				updatedAt: new Date(),
			},
			include: includeRelations,
		});

		return TabelaMontagemInfraMapper.toDomain(updated);
	}

	public async deleteById(id: number, usuarioId: number): Promise<void> {
		await this.prisma.tabelaMontagem.delete({
			where: { id, AND: { Cliente: { usuarioId } } },
		});
	}
}
