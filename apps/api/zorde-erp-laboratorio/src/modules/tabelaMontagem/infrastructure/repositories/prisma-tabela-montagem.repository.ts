import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { ITabelaMontagemRepository } from '../../domain/repositories/i-tabela-montagem.repository';
import { TabelaMontagemEntity } from '../../domain/entities/tabela-montagem.entity';
import { TipoServico } from '../../../../shared/enums/tipo-servico.enum';

class TabelaMontagemMapper {
  static toDomain(raw: any): TabelaMontagemEntity {
    return new TabelaMontagemEntity({
      id: raw.id,
      clienteId: raw.clienteId,
      servico: raw.servico as TipoServico,
      valor: raw.valor,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt || undefined,
      deletedAt: raw.deletedAt || undefined,
      nomeCliente: raw.cliente?.nome || undefined,
    });
  }

  static toPersistence(entity: TabelaMontagemEntity) {
    return {
      clienteId: entity.clienteId,
      servico: entity.servico,
      valor: entity.valor,
      createdAt: entity.createdAt,
    };
  }
}

@Injectable()
export class PrismaTabelaMontagemRepository implements ITabelaMontagemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criar(tabela: TabelaMontagemEntity): Promise<TabelaMontagemEntity> {
    const data = TabelaMontagemMapper.toPersistence(tabela);
    const created = await this.prisma.tabelaMontagem.create({
      data,
      include: { cliente: true },
    });
    return TabelaMontagemMapper.toDomain(created);
  }

  async buscarPorId(id: number): Promise<TabelaMontagemEntity | null> {
    const raw = await this.prisma.tabelaMontagem.findFirst({
      where: { id, deletedAt: null },
      include: { cliente: true },
    });
    if (!raw) return null;
    return TabelaMontagemMapper.toDomain(raw);
  }

  async listarPaginado(params: {
    page: number;
    limit: number;
    search?: string;
    usuarioId: number;
  }): Promise<{ items: TabelaMontagemEntity[]; total: number }> {
    const { page, limit, search, usuarioId } = params;
    const skip = (page - 1) * limit;
    const take = limit;

    const where: any = {
      deletedAt: null,
      cliente: {
        usuarioId,
        deletedAt: null,
      },
    };

    if (search) {
      where.OR = [
        {
          servico: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          cliente: {
            nome: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.tabelaMontagem.findMany({
        where,
        skip,
        take,
        include: { cliente: true },
        orderBy: { id: 'desc' },
      }),
      this.prisma.tabelaMontagem.count({ where }),
    ]);

    return {
      items: items.map(TabelaMontagemMapper.toDomain),
      total,
    };
  }

  async atualizar(id: number, tabela: Partial<TabelaMontagemEntity>): Promise<TabelaMontagemEntity> {
    const updateData: any = {};
    if (tabela.clienteId !== undefined) updateData.clienteId = tabela.clienteId;
    if (tabela.servico !== undefined) updateData.servico = tabela.servico;
    if (tabela.valor !== undefined) updateData.valor = tabela.valor;
    if (tabela.updatedAt !== undefined) updateData.updatedAt = tabela.updatedAt;

    const updated = await this.prisma.tabelaMontagem.update({
      where: { id },
      data: updateData,
      include: { cliente: true },
    });
    return TabelaMontagemMapper.toDomain(updated);
  }

  async deletarSoft(id: number): Promise<void> {
    await this.prisma.tabelaMontagem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
