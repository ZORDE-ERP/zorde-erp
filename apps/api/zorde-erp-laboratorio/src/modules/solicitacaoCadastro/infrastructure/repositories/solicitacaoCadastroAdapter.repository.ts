import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import type { SolicitacaoCadastroEntity } from '../../domain/entities/solicitacaoCadastro.entity';
import type { ISolicitacaoCadastroRepository } from '../../domain/repositories/solicitacaoCadastro.repository';
import { SolicitacaoCadastroInfraMapper } from '../mappers/solicitacaoCadastroInfra.mapper';

@Injectable()
export class PrismaSolicitacaoCadastroRepository implements ISolicitacaoCadastroRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async criar(solicitacao: SolicitacaoCadastroEntity): Promise<SolicitacaoCadastroEntity> {
		const data = SolicitacaoCadastroInfraMapper.toPersistence(solicitacao);
		const created = await this.prisma.solicitacaoCadastro.create({ data });
		return SolicitacaoCadastroInfraMapper.toDomain(created);
	}

	public async buscarPorEmail(email: string): Promise<SolicitacaoCadastroEntity | null> {
		const raw = await this.prisma.solicitacaoCadastro.findUnique({ where: { email } });
		if (!raw) return null;
		return SolicitacaoCadastroInfraMapper.toDomain(raw);
	}

	public async deletarPorEmail(email: string): Promise<void> {
		await this.prisma.solicitacaoCadastro.deleteMany({ where: { email } });
	}
}
