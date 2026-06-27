import { Injectable } from '@nestjs/common';
import type { Cliente, OrdemDeServico, TabelaMontagem } from '@prisma/client';
import type { TipoPessoa } from 'src/shared/enums/tipo-pessoa.enum';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import type { TipoServico } from '../../../../shared/enums/tipo-servico.enum';
import { ClienteEntity } from '../../../cliente/domain/entities/cliente.entity';
import { TabelaMontagemEntity } from '../../../tabelaMontagem/domain/entities/tabela-montagem.entity';
import { OrdemDeServicoEntity } from '../../domain/entities/ordem-de-servico.entity';
import type { IOrdemDeServicoRepository } from '../../domain/repositories/i-ordem-de-servico.repository';

type RawOrdemDeServico = OrdemDeServico & {
	cliente?: Cliente | null;
	tabelaMontagem?: TabelaMontagem | null;
};

const OrdemDeServicoMapper = {
	toDomain(raw: RawOrdemDeServico): OrdemDeServicoEntity {
		return new OrdemDeServicoEntity({
			id: raw.id,
			codigoOs: raw.codigoOS,
			clienteId: raw.clienteId,
			valor: raw.valor || undefined,
			tabelaMontagemId: raw.tabelaMontagemId || undefined,
			usuarioId: raw.usuarioId,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt || undefined,
			deletedAt: raw.deletedAt || undefined,
			cliente: raw.cliente
				? new ClienteEntity({
						id: raw.cliente.id,
						nome: raw.cliente.nome,
						tipoPessoa: raw.cliente.tipoPessoa as unknown as TipoPessoa,
						documento: raw.cliente.documento,
						usuarioId: raw.cliente.usuarioId,
						createdAt: raw.cliente.createdAt,
						updatedAt: raw.cliente.updatedAt || undefined,
						deletedAt: raw.cliente.deletedAt || undefined,
					})
				: undefined,
			tabelaMontagem: raw.tabelaMontagem
				? new TabelaMontagemEntity({
						id: raw.tabelaMontagem.id,
						clienteId: raw.tabelaMontagem.clienteId,
						servico: raw.tabelaMontagem.servico as TipoServico,
						valor: raw.tabelaMontagem.valor,
						createdAt: raw.tabelaMontagem.createdAt,
						updatedAt: raw.tabelaMontagem.updatedAt || undefined,
						deletedAt: raw.tabelaMontagem.deletedAt || undefined,
					})
				: undefined,
		});
	},

	toPersistence(entity: OrdemDeServicoEntity): {
		codigoOS: string;
		clienteId: number;
		valor: number | undefined;
		tabelaMontagemId: number | undefined;
		usuarioId: number;
		createdAt: Date;
	} {
		return {
			codigoOS: entity.codigoOs,
			clienteId: entity.clienteId,
			valor: entity.valor,
			tabelaMontagemId: entity.tabelaMontagemId,
			usuarioId: entity.usuarioId,
			createdAt: entity.createdAt,
		};
	},
};

@Injectable()
export class PrismaOrdemDeServicoRepository implements IOrdemDeServicoRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async criar(ordem: OrdemDeServicoEntity): Promise<OrdemDeServicoEntity> {
		const data = OrdemDeServicoMapper.toPersistence(ordem);
		const created = await this.prisma.ordemDeServico.create({
			data,
			include: { cliente: true, tabelaMontagem: true },
		});
		return OrdemDeServicoMapper.toDomain(created);
	}

	public async buscarPorId(id: number): Promise<OrdemDeServicoEntity | null> {
		const raw = await this.prisma.ordemDeServico.findFirst({
			where: { id, deletedAt: null },
			include: { cliente: true, tabelaMontagem: true },
		});
		if (!raw) return null;
		return OrdemDeServicoMapper.toDomain(raw);
	}

	public async listarPorUsuario(usuarioId: number): Promise<OrdemDeServicoEntity[]> {
		const items = await this.prisma.ordemDeServico.findMany({
			where: { usuarioId, deletedAt: null },
			include: { cliente: true, tabelaMontagem: true },
			orderBy: { id: 'desc' },
		});
		return items.map(OrdemDeServicoMapper.toDomain);
	}

	public async atualizar(id: number, ordem: Partial<OrdemDeServicoEntity>): Promise<OrdemDeServicoEntity> {
		const updateData: Record<string, unknown> = {};
		if (ordem.codigoOs !== undefined) updateData.codigoOS = ordem.codigoOs;
		if (ordem.clienteId !== undefined) updateData.clienteId = ordem.clienteId;
		if (ordem.valor !== undefined) updateData.valor = ordem.valor;
		if (ordem.tabelaMontagemId !== undefined) updateData.tabelaMontagemId = ordem.tabelaMontagemId;
		if (ordem.updatedAt !== undefined) updateData.updatedAt = ordem.updatedAt;

		const updated = await this.prisma.ordemDeServico.update({
			where: { id },
			data: updateData,
			include: { cliente: true, tabelaMontagem: true },
		});
		return OrdemDeServicoMapper.toDomain(updated);
	}

	public async deletarSoft(id: number): Promise<void> {
		await this.prisma.ordemDeServico.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}
