import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { IOrdemDeServicoRepository } from '../../domain/repositories/i-ordem-de-servico.repository';
import { OrdemDeServicoEntity } from '../../domain/entities/ordem-de-servico.entity';
import { ClienteEntity } from '../../../cliente/domain/entities/cliente.entity';
import { TabelaMontagemEntity } from '../../../tabelaMontagem/domain/entities/tabela-montagem.entity';
import { TipoServico } from '../../../../shared/enums/tipo-servico.enum';

class OrdemDeServicoMapper {
  static toDomain(raw: any): OrdemDeServicoEntity {
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
            tipoPessoa: raw.cliente.tipoPessoa,
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
  }

  static toPersistence(entity: OrdemDeServicoEntity) {
    return {
      codigoOS: entity.codigoOs,
      clienteId: entity.clienteId,
      valor: entity.valor,
      tabelaMontagemId: entity.tabelaMontagemId,
      usuarioId: entity.usuarioId,
      createdAt: entity.createdAt,
    };
  }
}

@Injectable()
export class PrismaOrdemDeServicoRepository implements IOrdemDeServicoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criar(ordem: OrdemDeServicoEntity): Promise<OrdemDeServicoEntity> {
    const data = OrdemDeServicoMapper.toPersistence(ordem);
    const created = await this.prisma.ordemDeServico.create({
      data,
      include: { cliente: true, tabelaMontagem: true },
    });
    return OrdemDeServicoMapper.toDomain(created);
  }

  async buscarPorId(id: number): Promise<OrdemDeServicoEntity | null> {
    const raw = await this.prisma.ordemDeServico.findFirst({
      where: { id, deletedAt: null },
      include: { cliente: true, tabelaMontagem: true },
    });
    if (!raw) return null;
    return OrdemDeServicoMapper.toDomain(raw);
  }

  async listarPorUsuario(usuarioId: number): Promise<OrdemDeServicoEntity[]> {
    const items = await this.prisma.ordemDeServico.findMany({
      where: { usuarioId, deletedAt: null },
      include: { cliente: true, tabelaMontagem: true },
      orderBy: { id: 'desc' },
    });
    return items.map(OrdemDeServicoMapper.toDomain);
  }

  async atualizar(id: number, ordem: Partial<OrdemDeServicoEntity>): Promise<OrdemDeServicoEntity> {
    const updateData: any = {};
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

  async deletarSoft(id: number): Promise<void> {
    await this.prisma.ordemDeServico.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
