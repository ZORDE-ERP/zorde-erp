import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { TabelaMontagemEntity } from '../../domain/entities/tabelaMontagem.entity';
import { ITabelaMontagemRepository } from '../../domain/repositories/tabelaMontagem.repository';
import { TabelaMontagemInfraMapper } from '../mappers/tabelaMontagemInfra.mapper';

@Injectable()
export class PrismaTabelaMontagemRepository implements ITabelaMontagemRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async create(tabela: TabelaMontagemEntity): Promise<TabelaMontagemEntity> {
		const data = TabelaMontagemInfraMapper.toPersistence(tabela);
		const created = await this.prisma.tabelaMontagem.create({
			data,
			include: { Cliente: true },
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
			include: { Cliente: true },
		});

		if (!raw) return null;

		return TabelaMontagemInfraMapper.toDomain(raw);
	}

	public async findAllPaginated(params: {
		page: number;
		limit: number;
		search?: string;
		usuarioId: number;
	}): Promise<{ items: TabelaMontagemEntity[]; total: number }> {
		const { page, limit, search, usuarioId } = params;
		const skip = (page - 1) * limit;
		const take = limit;

		const where: Record<string, unknown> = {
			deletedAt: null,
			Cliente: {
				usuarioId,
				deletedAt: null,
			},
		};

		if (search) {
			where.OR = [
				{
					servico: {
						contains: search,
						mode: 'insensitive',
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
				include: { Cliente: true },
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
				servico: tabela.getServico(),
				valor: tabela.getValor(),
				updatedAt: new Date(),
			},
			include: { Cliente: true },
		});

		return TabelaMontagemInfraMapper.toDomain(updated);
	}

	public async softDelete(id: number, _usuarioId: number): Promise<void> {
		await this.prisma.tabelaMontagem.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}
