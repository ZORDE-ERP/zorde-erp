import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { ISolicitacaoCadastroRepository } from '../../domain/repositories/i-solicitacao-cadastro.repository';
import { SolicitacaoCadastroEntity } from '../../domain/entities/solicitacao-cadastro.entity';
import { SolicitacaoCadastro } from '@prisma/client';

class SolicitacaoCadastroMapper {
  static toDomain(raw: SolicitacaoCadastro): SolicitacaoCadastroEntity {
    return new SolicitacaoCadastroEntity({
      id: raw.id,
      email: raw.email,
      codigo: raw.codigo,
      expiracao: raw.expiracao,
      criadoEm: raw.criado_em,
    });
  }

  static toPersistence(entity: SolicitacaoCadastroEntity) {
    return {
      email: entity.email,
      codigo: entity.codigo,
      expiracao: entity.expiracao,
      criado_em: entity.criadoEm,
    };
  }
}

@Injectable()
export class PrismaSolicitacaoCadastroRepository implements ISolicitacaoCadastroRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criar(solicitacao: SolicitacaoCadastroEntity): Promise<SolicitacaoCadastroEntity> {
    const data = SolicitacaoCadastroMapper.toPersistence(solicitacao);
    const created = await this.prisma.solicitacaoCadastro.create({
      data,
    });
    return SolicitacaoCadastroMapper.toDomain(created);
  }

  async buscarPorEmail(email: string): Promise<SolicitacaoCadastroEntity | null> {
    const raw = await this.prisma.solicitacaoCadastro.findUnique({
      where: { email },
    });
    if (!raw) return null;
    return SolicitacaoCadastroMapper.toDomain(raw);
  }

  async deletarPorEmail(email: string): Promise<void> {
    try {
      await this.prisma.solicitacaoCadastro.deleteMany({
        where: { email },
      });
    } catch {
      // Ignora erro se não existir registro
    }
  }
}
