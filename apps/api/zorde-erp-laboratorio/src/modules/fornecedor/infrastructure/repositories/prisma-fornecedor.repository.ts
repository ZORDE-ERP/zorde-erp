import { Injectable } from '@nestjs/common';
import type { Fornecedor } from '@prisma/client';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import type { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';
import type { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';
import { FornecedorEntity } from '../../domain/entities/fornecedor.entity';
import type { IFornecedorRepository } from '../../domain/repositories/i-fornecedor.repository';

const FornecedorMapper = {
	toDomain(raw: Fornecedor): FornecedorEntity {
		return new FornecedorEntity({
			id: raw.id,
			nome: raw.nome,
			email: raw.email,
			contato: raw.contato || undefined,
			tipoPessoa: raw.tipoPessoa as TipoPessoa,
			documento: raw.documento,
			status: raw.status as StatusPessoa,
			cep: raw.cep || undefined,
			observacao: raw.observacao || undefined,
			usuarioId: raw.usuarioId,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt || undefined,
			deletedAt: raw.deletedAt || undefined,
		});
	},

	toPersistence(entity: FornecedorEntity): {
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
export class PrismaFornecedorRepository implements IFornecedorRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async criar(fornecedor: FornecedorEntity): Promise<FornecedorEntity> {
		const data = FornecedorMapper.toPersistence(fornecedor);
		const created = await this.prisma.fornecedor.create({ data });
		return FornecedorMapper.toDomain(created);
	}

	public async buscarPorId(id: number): Promise<FornecedorEntity | null> {
		const raw = await this.prisma.fornecedor.findFirst({
			where: { id, deletedAt: null },
		});
		if (!raw) return null;
		return FornecedorMapper.toDomain(raw);
	}

	public async listarPorUsuario(usuarioId: number): Promise<FornecedorEntity[]> {
		const list = await this.prisma.fornecedor.findMany({
			where: { usuarioId, deletedAt: null },
			orderBy: { id: 'asc' },
		});
		return list.map(FornecedorMapper.toDomain);
	}

	public async atualizar(id: number, fornecedor: Partial<FornecedorEntity>): Promise<FornecedorEntity> {
		const updateData: Record<string, unknown> = {};
		if (fornecedor.nome !== undefined) updateData.nome = fornecedor.nome;
		if (fornecedor.email !== undefined) updateData.email = fornecedor.email;
		if (fornecedor.contato !== undefined) updateData.contato = fornecedor.contato;
		if (fornecedor.tipoPessoa !== undefined) updateData.tipoPessoa = fornecedor.tipoPessoa;
		if (fornecedor.documento !== undefined) updateData.documento = fornecedor.documento;
		if (fornecedor.status !== undefined) updateData.status = fornecedor.status;
		if (fornecedor.cep !== undefined) updateData.cep = fornecedor.cep;
		if (fornecedor.uf !== undefined) updateData.uf = fornecedor.uf;
		if (fornecedor.cidade !== undefined) updateData.cidade = fornecedor.cidade;
		if (fornecedor.logradouro !== undefined) updateData.logradouro = fornecedor.logradouro;
		if (fornecedor.numero !== undefined) updateData.numero = fornecedor.numero;
		if (fornecedor.bairro !== undefined) updateData.bairro = fornecedor.bairro;
		if (fornecedor.observacao !== undefined) updateData.observacao = fornecedor.observacao;
		if (fornecedor.updatedAt !== undefined) updateData.updatedAt = fornecedor.updatedAt;

		const updated = await this.prisma.fornecedor.update({
			where: { id },
			data: updateData,
		});
		return FornecedorMapper.toDomain(updated);
	}

	public async deletarSoft(id: number): Promise<void> {
		await this.prisma.fornecedor.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}
