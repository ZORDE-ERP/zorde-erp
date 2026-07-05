import { Injectable } from '@nestjs/common';
import type { Endereco, Fornecedor } from '@prisma/client';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { FornecedorEntity } from '../../domain/entities/fornecedor.entity';
import { IFornecedorRepository } from '../../domain/repositories/fornecedor.repository';
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

	public async softDelete(id: number, usuarioId: number): Promise<void> {
		await this.prisma.fornecedor.update({
			where: { id, AND: { usuarioId } },
			data: { deletedAt: new Date() },
		});
	}
}
