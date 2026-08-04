import { Injectable } from '@nestjs/common';
import type { Endereco, Fornecedor } from '@prisma/client';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { FornecedorEntity } from '../../domain/entities/fornecedor.entity';
import type { IFornecedorRepository, UpdateFornecedorLogoData } from '../../domain/repositories/fornecedor.repository';
import { FornecedorInfraMapper } from '../mappers/fornecedorInfra.mapper';

@Injectable()
export class PrismaFornecedorRepository implements IFornecedorRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async create(fornecedor: FornecedorEntity): Promise<FornecedorEntity> {
		const newSupplier = await this.prisma.fornecedor.create({
			data: {
				documento: fornecedor.getDocumento(),
				nome: fornecedor.getNome(),
				email: fornecedor.getEmail(),
				tipoPessoa: fornecedor.getTipoPessoa(),
				contato: fornecedor.getContato(),
				status: fornecedor.getStatus(),
				cep: fornecedor.getCep(),
				observacao: fornecedor.getObservacao(),
				usuarioId: fornecedor.getUsuarioId(),
				createdAt: new Date(),
				nomeFantasia: fornecedor.getNomeFantasia(),
				razaoSocial: fornecedor.getRazaoSocial(),
				numeroEndereco: fornecedor.getNumeroEndereco(),
			},
			include: {
				Endereco: true,
			},
		});

		return FornecedorInfraMapper.toDomain(newSupplier as Fornecedor & { Endereco: Endereco });
	}

	public async findById(id: number, usuarioId: number): Promise<FornecedorEntity | null> {
		const raw = await this.prisma.fornecedor.findFirst({
			where: {
				id,
				AND: [{ usuarioId }, { deletedAt: null }],
			},
			include: {
				Endereco: true,
			},
		});

		if (!raw) return null;

		return FornecedorInfraMapper.toDomain(raw as Fornecedor & { Endereco: Endereco });
	}

	public async findByUsuarioId(usuarioId: number): Promise<FornecedorEntity[]> {
		const suppliers = await this.prisma.fornecedor.findMany({
			where: { usuarioId, deletedAt: null },
			include: {
				Endereco: true,
			},
			orderBy: { id: 'asc' },
		});
		return suppliers.map(FornecedorInfraMapper.toDomain);
	}

	public async findAllPaginated(params: {
		page: number;
		limit: number;
		search?: string;
		status?: string;
		usuarioId: number;
	}): Promise<{ items: FornecedorEntity[]; total: number }> {
		const { page, limit, search, status, usuarioId } = params;
		const skip = (page - 1) * limit;

		const where: Record<string, unknown> = {
			usuarioId,
			deletedAt: null,
		};

		if (status) {
			where.status = status;
		}

		const term = search?.trim();
		if (term) {
			where.OR = [
				{ nome: { contains: term, mode: 'insensitive' } },
				{ documento: { contains: term, mode: 'insensitive' } },
				{ email: { contains: term, mode: 'insensitive' } },
				{ nomeFantasia: { contains: term, mode: 'insensitive' } },
				{ razaoSocial: { contains: term, mode: 'insensitive' } },
			];
		}

		const [items, total] = await Promise.all([
			this.prisma.fornecedor.findMany({
				where,
				skip,
				take: limit,
				include: { Endereco: true },
				orderBy: { id: 'desc' },
			}),
			this.prisma.fornecedor.count({ where }),
		]);

		return {
			items: items.map((item) => FornecedorInfraMapper.toDomain(item as Fornecedor & { Endereco: Endereco })),
			total,
		};
	}

	public async countByStatus(usuarioId: number): Promise<{ total: number; ativos: number; inativos: number }> {
		const where = { usuarioId, deletedAt: null };
		const [total, ativos, inativos] = await Promise.all([
			this.prisma.fornecedor.count({ where }),
			this.prisma.fornecedor.count({ where: { ...where, status: 'ATIVO' } }),
			this.prisma.fornecedor.count({ where: { ...where, status: 'INATIVO' } }),
		]);
		return { total, ativos, inativos };
	}

	public async update(fornecedor: FornecedorEntity): Promise<FornecedorEntity> {
		const updated = await this.prisma.fornecedor.update({
			where: {
				id: fornecedor.getId() as number,
				AND: { usuarioId: { equals: fornecedor.getUsuarioId() } },
			},
			data: {
				nome: fornecedor.getNome(),
				email: fornecedor.getEmail(),
				contato: fornecedor.getContato(),
				tipoPessoa: fornecedor.getTipoPessoa(),
				documento: fornecedor.getDocumento(),
				status: fornecedor.getStatus(),
				cep: fornecedor.getCep(),
				observacao: fornecedor.getObservacao(),
				razaoSocial: fornecedor.getRazaoSocial(),
				nomeFantasia: fornecedor.getNomeFantasia(),
				numeroEndereco: fornecedor.getNumeroEndereco(),
				updatedAt: new Date(),
			},
			include: {
				Endereco: true,
			},
		});
		return FornecedorInfraMapper.toDomain(updated as Fornecedor & { Endereco: Endereco });
	}

	public async updateLogo(id: number, usuarioId: number, data: UpdateFornecedorLogoData): Promise<FornecedorEntity> {
		const existing = await this.findById(id, usuarioId);
		if (!existing) {
			throw new Error('Fornecedor não encontrado');
		}

		const updated = await this.prisma.fornecedor.update({
			where: { id },
			data: {
				logoUrl: data.logoUrl,
				logoPublicId: data.logoPublicId,
				updatedAt: new Date(),
			},
			include: {
				Endereco: true,
			},
		});
		return FornecedorInfraMapper.toDomain(updated as Fornecedor & { Endereco: Endereco });
	}

	public async softDelete(id: number, usuarioId: number): Promise<void> {
		await this.prisma.fornecedor.update({
			where: { id, AND: { usuarioId } },
			data: { deletedAt: new Date() },
		});
	}
}
