import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { ServicoEntity } from '../../domain/entities/servico.entity';
import { IServicoRepository } from '../../domain/repositories/servico.repository';
import { ServicoInfraMapper } from '../mappers/servicoInfra.mapper';

@Injectable()
export class PrismaServicoRepository implements IServicoRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async create(servico: ServicoEntity): Promise<ServicoEntity> {
		const data = ServicoInfraMapper.toPersistence(servico);
		const created = await this.prisma.servico.create({
			data: {
				...data,
				createdAt: new Date(),
			},
		});
		return ServicoInfraMapper.toDomain(created);
	}

	public async findById(id: number, usuarioId: number): Promise<ServicoEntity | null> {
		const raw = await this.prisma.servico.findFirst({
			where: {
				id,
				usuarioId,
			},
		});

		if (!raw) return null;

		return ServicoInfraMapper.toDomain(raw);
	}

	public async findAllPaginated(params: {
		page: number;
		limit: number;
		search?: string;
		usuarioId: number;
	}): Promise<{ items: ServicoEntity[]; total: number }> {
		const { page, limit, search, usuarioId } = params;
		const skip = (page - 1) * limit;
		const take = limit;

		const where: Record<string, unknown> = { usuarioId };

		if (search) {
			where.OR = [
				{
					nome: {
						contains: search,
						mode: 'insensitive',
					},
				},
				{
					descricao: {
						contains: search,
						mode: 'insensitive',
					},
				},
			];
		}

		const [items, total] = await Promise.all([
			this.prisma.servico.findMany({
				where,
				skip,
				take,
				orderBy: { id: 'desc' },
			}),
			this.prisma.servico.count({ where }),
		]);

		return {
			items: items.map(ServicoInfraMapper.toDomain),
			total,
		};
	}

	public async update(servico: ServicoEntity): Promise<ServicoEntity> {
		const updated = await this.prisma.servico.update({
			where: {
				id: servico.getId() as number,
				AND: { usuarioId: { equals: servico.getUsuarioId() } },
			},
			data: {
				nome: servico.getNome(),
				descricao: servico.getDescricao(),
				updatedAt: new Date(),
			},
		});

		return ServicoInfraMapper.toDomain(updated);
	}

	public async delete(id: number, usuarioId: number): Promise<void> {
		await this.prisma.servico.delete({
			where: { id, usuarioId },
		});
	}
}
