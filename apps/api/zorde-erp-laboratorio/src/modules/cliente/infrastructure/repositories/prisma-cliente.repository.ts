import { Injectable } from '@nestjs/common';
import type { Cliente } from '@prisma/client';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import type { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';
import type { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';
import { ClienteEntity } from '../../domain/entities/cliente.entity';
import type { IClienteRepository } from '../../domain/repositories/i-cliente.repository';

const ClienteMapper = {
	toDomain(raw: Cliente): ClienteEntity {
		return new ClienteEntity({
			id: raw.id,
			nome: raw.nome,
			email: raw.email,
			contato: raw.contato || undefined,
			tipoPessoa: raw.tipoPessoa as TipoPessoa,
			documento: raw.documento,
			status: raw.status as StatusPessoa,
			cep: raw.cep || undefined,
			uf: raw.uf || undefined,
			cidade: raw.cidade || undefined,
			logradouro: raw.logradouro || undefined,
			numero: raw.numero || undefined,
			bairro: raw.bairro || undefined,
			observacao: raw.observacao || undefined,
			usuarioId: raw.usuarioId,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt || undefined,
			deletedAt: raw.deletedAt || undefined,
		});
	},

	toPersistence(entity: ClienteEntity): {
		nome: string;
		email: string;
		contato: string | undefined;
		tipoPessoa: TipoPessoa;
		documento: string;
		status: StatusPessoa;
		cep: string | undefined;
		uf: string | undefined;
		cidade: string | undefined;
		logradouro: string | undefined;
		numero: string | undefined;
		bairro: string | undefined;
		observacao: string | undefined;
		usuarioId: number;
		createdAt: Date;
	} {
		return {
			nome: entity.nome,
			email: entity.email,
			contato: entity.contato,
			tipoPessoa: entity.tipoPessoa,
			documento: entity.documento,
			status: entity.status,
			cep: entity.cep,
			uf: entity.uf,
			cidade: entity.cidade,
			logradouro: entity.logradouro,
			numero: entity.numero,
			bairro: entity.bairro,
			observacao: entity.observacao,
			usuarioId: entity.usuarioId,
			createdAt: entity.createdAt,
		};
	},
};

@Injectable()
export class PrismaClienteRepository implements IClienteRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async criar(cliente: ClienteEntity): Promise<ClienteEntity> {
		const data = ClienteMapper.toPersistence(cliente);
		const created = await this.prisma.cliente.create({ data });
		return ClienteMapper.toDomain(created);
	}

	public async buscarPorId(id: number): Promise<ClienteEntity | null> {
		const raw = await this.prisma.cliente.findFirst({
			where: { id, deletedAt: null },
		});
		if (!raw) return null;
		return ClienteMapper.toDomain(raw);
	}

	public async listarPorUsuario(usuarioId: number): Promise<ClienteEntity[]> {
		const list = await this.prisma.cliente.findMany({
			where: { usuarioId, deletedAt: null },
			orderBy: { id: 'asc' },
		});
		return list.map(ClienteMapper.toDomain);
	}

	public async atualizar(id: number, cliente: Partial<ClienteEntity>): Promise<ClienteEntity> {
		const updateData: Record<string, unknown> = {};
		if (cliente.nome !== undefined) updateData.nome = cliente.nome;
		if (cliente.email !== undefined) updateData.email = cliente.email;
		if (cliente.contato !== undefined) updateData.contato = cliente.contato;
		if (cliente.tipoPessoa !== undefined) updateData.tipoPessoa = cliente.tipoPessoa;
		if (cliente.documento !== undefined) updateData.documento = cliente.documento;
		if (cliente.status !== undefined) updateData.status = cliente.status;
		if (cliente.cep !== undefined) updateData.cep = cliente.cep;
		if (cliente.uf !== undefined) updateData.uf = cliente.uf;
		if (cliente.cidade !== undefined) updateData.cidade = cliente.cidade;
		if (cliente.logradouro !== undefined) updateData.logradouro = cliente.logradouro;
		if (cliente.numero !== undefined) updateData.numero = cliente.numero;
		if (cliente.bairro !== undefined) updateData.bairro = cliente.bairro;
		if (cliente.observacao !== undefined) updateData.observacao = cliente.observacao;
		if (cliente.updatedAt !== undefined) updateData.updatedAt = cliente.updatedAt;

		const updated = await this.prisma.cliente.update({
			where: { id },
			data: updateData,
		});
		return ClienteMapper.toDomain(updated);
	}

	public async deletarSoft(id: number): Promise<void> {
		await this.prisma.cliente.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}
