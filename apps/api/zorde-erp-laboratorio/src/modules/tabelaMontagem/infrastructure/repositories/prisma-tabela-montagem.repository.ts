import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { ITabelaMontagemRepository } from '../../domain/repositories/i-tabela-montagem.repository';
import { TabelaMontagemEntity } from '../../domain/entities/tabela-montagem.entity';
import { TabelaMontagem } from '@prisma/client';
import { TipoServico } from '../../../../shared/enums/tipo-servico.enum';

class TabelaMontagemMapper {
  static toDomain(raw: any): TabelaMontagemEntity {
    return new TabelaMontagemEntity({
      id: raw.id,
      clienteId: raw.cliente_id,
      servico: raw.servico as TipoServico,
      valor: raw.valor,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at || undefined,
      deletedAt: raw.deleted_at || undefined,
      nomeCliente: raw.cliente?.nome || undefined,
    });
  }

  static toPersistence(entity: TabelaMontagemEntity) {
    return {
      cliente_id: entity.clienteId,
      servico: entity.servico,
      valor: entity.valor,
      created_at: entity.createdAt,
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
      where: { id, deleted_at: null },
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
      deleted_at: null,
      cliente: {
        usuario_id: usuarioId,
        deleted_at: null,
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
    if (tabela.clienteId !== undefined) updateData.cliente_id = tabela.clienteId;
    if (tabela.servico !== undefined) updateData.servico = tabela.servico;
    if (tabela.valor !== undefined) updateData.valor = tabela.valor;
    if (tabela.updatedAt !== undefined) updateData.updated_at = tabela.updatedAt;

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
      data: { deleted_at: new Date() },
    });
  }
}
