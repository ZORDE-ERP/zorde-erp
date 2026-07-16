import { Injectable } from '@nestjs/common';
import { Cliente, Endereco } from '@prisma/client';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { ClienteEntity } from '../../domain/entities/cliente.entity';
import type { IClienteRepository, UpdateQrCodeData } from '../../domain/repositories/cliente.repository';
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

	public async updateQrToken(
		id: number,
		usuarioId: number,
		qrToken: string,
		qrGeradoEm: Date,
	): Promise<ClienteEntity> {
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

	public async softDelete(id: number, usuarioId: number): Promise<void> {
		await this.prisma.cliente.update({
			where: { id, AND: { usuarioId } },
			data: { deletedAt: new Date() },
		});
	}
}
