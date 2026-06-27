import { Injectable } from '@nestjs/common';
import type { SolicitacaoCadastro } from '@prisma/client';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { SolicitacaoCadastroEntity } from '../../domain/entities/solicitacao-cadastro.entity';
import type { ISolicitacaoCadastroRepository } from '../../domain/repositories/i-solicitacao-cadastro.repository';

const SolicitacaoCadastroMapper = {
	toDomain(raw: SolicitacaoCadastro): SolicitacaoCadastroEntity {
		return new SolicitacaoCadastroEntity({
			id: raw.id,
			email: raw.email,
			codigo: raw.codigo,
			expiracao: raw.expiracao,
			criadoEm: raw.createdAt,
		});
	},

	toPersistence(entity: SolicitacaoCadastroEntity): {
		email: string;
		codigo: string;
		expiracao: Date;
		createdAt: Date;
	} {
		return {
			email: entity.email,
			codigo: entity.codigo,
			expiracao: entity.expiracao,
			createdAt: entity.criadoEm,
		};
	},
};

@Injectable()
export class PrismaSolicitacaoCadastroRepository implements ISolicitacaoCadastroRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async criar(solicitacao: SolicitacaoCadastroEntity): Promise<SolicitacaoCadastroEntity> {
		const data = SolicitacaoCadastroMapper.toPersistence(solicitacao);
		const created = await this.prisma.solicitacaoCadastro.create({
			data,
		});
		return SolicitacaoCadastroMapper.toDomain(created);
	}

	public async buscarPorEmail(email: string): Promise<SolicitacaoCadastroEntity | null> {
		const raw = await this.prisma.solicitacaoCadastro.findUnique({
			where: { email },
		});
		if (!raw) return null;
		return SolicitacaoCadastroMapper.toDomain(raw);
	}

	public async deletarPorEmail(email: string): Promise<void> {
		try {
			await this.prisma.solicitacaoCadastro.deleteMany({
				where: { email },
			});
		} catch {
			// Ignora erro se não existir registro
		}
	}
}
