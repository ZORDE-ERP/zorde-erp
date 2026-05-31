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
      codigoOs: raw.codigo_os,
      clienteId: raw.cliente_id,
      valor: raw.valor || undefined,
      tabelaMontagemId: raw.tabela_montagem_id || undefined,
      usuarioId: raw.usuario_id,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at || undefined,
      deletedAt: raw.deleted_at || undefined,
      cliente: raw.cliente
        ? new ClienteEntity({
            id: raw.cliente.id,
            nome: raw.cliente.nome,
            tipoPessoa: raw.cliente.tipo_pessoa,
            documento: raw.cliente.documento,
            usuarioId: raw.cliente.usuario_id,
            createdAt: raw.cliente.created_at,
            updatedAt: raw.cliente.updated_at || undefined,
            deletedAt: raw.cliente.deleted_at || undefined,
          })
        : undefined,
      tabelaMontagem: raw.tabelaMontagem
        ? new TabelaMontagemEntity({
            id: raw.tabelaMontagem.id,
            clienteId: raw.tabelaMontagem.cliente_id,
            servico: raw.tabelaMontagem.servico as TipoServico,
            valor: raw.tabelaMontagem.valor,
            createdAt: raw.tabelaMontagem.created_at,
            updatedAt: raw.tabelaMontagem.updated_at || undefined,
            deletedAt: raw.tabelaMontagem.deleted_at || undefined,
          })
        : undefined,
    });
  }

  static toPersistence(entity: OrdemDeServicoEntity) {
    return {
      codigo_os: entity.codigoOs,
      cliente_id: entity.clienteId,
      valor: entity.valor,
      tabela_montagem_id: entity.tabelaMontagemId,
      usuario_id: entity.usuarioId,
      created_at: entity.createdAt,
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
      where: { id, deleted_at: null },
      include: { cliente: true, tabelaMontagem: true },
    });
    if (!raw) return null;
    return OrdemDeServicoMapper.toDomain(raw);
  }

  async listarPorUsuario(usuarioId: number): Promise<OrdemDeServicoEntity[]> {
    const items = await this.prisma.ordemDeServico.findMany({
      where: { usuario_id: usuarioId, deleted_at: null },
      include: { cliente: true, tabelaMontagem: true },
      orderBy: { id: 'desc' },
    });
    return items.map(OrdemDeServicoMapper.toDomain);
  }

  async atualizar(id: number, ordem: Partial<OrdemDeServicoEntity>): Promise<OrdemDeServicoEntity> {
    const updateData: any = {};
    if (ordem.codigoOs !== undefined) updateData.codigo_os = ordem.codigoOs;
    if (ordem.clienteId !== undefined) updateData.cliente_id = ordem.clienteId;
    if (ordem.valor !== undefined) updateData.valor = ordem.valor;
    if (ordem.tabelaMontagemId !== undefined) updateData.tabela_montagem_id = ordem.tabelaMontagemId;
    if (ordem.updatedAt !== undefined) updateData.updated_at = ordem.updatedAt;

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
      data: { deleted_at: new Date() },
    });
  }
}
