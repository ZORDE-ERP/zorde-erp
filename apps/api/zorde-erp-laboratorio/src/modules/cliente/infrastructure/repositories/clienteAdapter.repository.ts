import { Injectable } from '@nestjs/common';
import { Cliente, Endereco } from '@prisma/client';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { ClienteEntity } from '../../domain/entities/cliente.entity';
import type { IClienteRepository, UpdateLogoData, UpdateQrCodeData } from '../../domain/repositories/cliente.repository';
import { ClienteInfraMapper } from '../mappers/clienteInfra.mapper';

@Injectable()
export class PrismaClienteRepository implements IClienteRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async create(cliente: ClienteEntity): Promise<ClienteEntity> {
		// const data = ClienteInfraMapper.toPersistence(cliente);
		const newClient = await this.prisma.cliente.create({
			data: {
				documento: cliente.getDocumento(),
				nome: cliente.getNome(),
				email: cliente.getEmail(),
				tipoPessoa: cliente.getTipoPessoa(),
				contato: cliente.getContato(),
				status: cliente.getStatus(),
				cep: cliente.getCep(),
				observacao: cliente.getObservacao(),
				usuarioId: cliente.getUsuarioId(),
				createdAt: new Date(),
				nomeFantasia: cliente.getNomeFantasia(),
				razaoSocial: cliente.getRazaoSocial(),
				numeroEndereco: cliente.getNumeroEndereco(),
			},
			include: {
				Endereco: true,
			},
		});

		return ClienteInfraMapper.toDomain(newClient as Cliente & { Endereco: Endereco });
	}

	public async findById(id: number, usuarioId: number): Promise<ClienteEntity | null> {
		const raw = await this.prisma.cliente.findFirst({
			where: {
				id,
				AND: [{ usuarioId }, { deletedAt: null }],
			},
			include: {
				Endereco: true,
			},
		});

		if (!raw) return null;

		return ClienteInfraMapper.toDomain(raw as Cliente & { Endereco: Endereco });
	}

	public async findByUsuarioId(usuarioId: number): Promise<ClienteEntity[]> {
		const clients = await this.prisma.cliente.findMany({
			where: { usuarioId, deletedAt: null },
			include: {
				Endereco: true,
			},
			orderBy: { id: 'asc' },
		});
		return clients.map(ClienteInfraMapper.toDomain);
	}

	public async findAllPaginated(params: {
		page: number;
		limit: number;
		search?: string;
		status?: string;
		id?: number;
		usuarioId: number;
	}): Promise<{ items: ClienteEntity[]; total: number }> {
		const { page, limit, search, status, id, usuarioId } = params;
		const skip = (page - 1) * limit;

		const where: Record<string, unknown> = {
			usuarioId,
			deletedAt: null,
		};

		if (id != null) {
			where.id = id;
		}

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
			this.prisma.cliente.findMany({
				where,
				skip,
				take: limit,
				include: { Endereco: true },
				orderBy: { id: 'desc' },
			}),
			this.prisma.cliente.count({ where }),
		]);

		return {
			items: items.map((item) => ClienteInfraMapper.toDomain(item as Cliente & { Endereco: Endereco })),
			total,
		};
	}

	public async countByStatus(usuarioId: number): Promise<{ total: number; ativos: number; inativos: number }> {
		const where = { usuarioId, deletedAt: null };
		const [total, ativos, inativos] = await Promise.all([
			this.prisma.cliente.count({ where }),
			this.prisma.cliente.count({ where: { ...where, status: 'ATIVO' } }),
			this.prisma.cliente.count({ where: { ...where, status: 'INATIVO' } }),
		]);
		return { total, ativos, inativos };
	}

	public async update(client: ClienteEntity): Promise<ClienteEntity> {
		const updated = await this.prisma.cliente.update({
			where: { id: client.getId() as number, AND: { usuarioId: { equals: client.getUsuarioId() } } },
			data: {
				nome: client.getNome(),
				email: client.getEmail(),
				contato: client.getContato(),
				tipoPessoa: client.getTipoPessoa(),
				documento: client.getDocumento(),
				status: client.getStatus(),
				cep: client.getCep(),
				observacao: client.getObservacao(),
				razaoSocial: client.getRazaoSocial(),
				nomeFantasia: client.getNomeFantasia(),
				numeroEndereco: client.getNumeroEndereco(),
				updatedAt: new Date(),
			},
			include: {
				Endereco: true,
			},
		});
		return ClienteInfraMapper.toDomain(updated as Cliente & { Endereco: Endereco });
	}

	public async updateQrToken(id: number, usuarioId: number, qrToken: string, qrGeradoEm: Date): Promise<ClienteEntity> {
		const existing = await this.findById(id, usuarioId);
		if (!existing) {
			throw new Error('Cliente não encontrado');
		}

		const updated = await this.prisma.cliente.update({
			where: { id },
			data: {
				qrToken,
				qrGeradoEm,
				updatedAt: new Date(),
			},
			include: {
				Endereco: true,
			},
		});
		return ClienteInfraMapper.toDomain(updated as Cliente & { Endereco: Endereco });
	}

	public async updateQrCode(id: number, usuarioId: number, data: UpdateQrCodeData): Promise<ClienteEntity> {
		const existing = await this.findById(id, usuarioId);
		if (!existing) {
			throw new Error('Cliente não encontrado');
		}

		const updated = await this.prisma.cliente.update({
			where: { id },
			data: {
				qrToken: data.qrToken,
				qrGeradoEm: data.qrGeradoEm,
				qrCodeUrl: data.qrCodeUrl,
				qrCodePublicId: data.qrCodePublicId,
				updatedAt: new Date(),
			},
			include: {
				Endereco: true,
			},
		});
		return ClienteInfraMapper.toDomain(updated as Cliente & { Endereco: Endereco });
	}

	public async updateLogo(id: number, usuarioId: number, data: UpdateLogoData): Promise<ClienteEntity> {
		const existing = await this.findById(id, usuarioId);
		if (!existing) {
			throw new Error('Cliente não encontrado');
		}

		const updated = await this.prisma.cliente.update({
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
		return ClienteInfraMapper.toDomain(updated as Cliente & { Endereco: Endereco });
	}

	public async softDelete(id: number, usuarioId: number): Promise<void> {
		await this.prisma.cliente.update({
			where: { id, AND: { usuarioId } },
			data: { deletedAt: new Date() },
		});
	}
}
