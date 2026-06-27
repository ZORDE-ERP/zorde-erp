import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { IClienteRepository } from '../../domain/repositories/i-cliente.repository';
import { ClienteEntity } from '../../domain/entities/cliente.entity';
import { Cliente } from '@prisma/client';
import { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';
import { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';

class ClienteMapper {
  static toDomain(raw: Cliente): ClienteEntity {
    return new ClienteEntity({
      id: raw.id,
      nome: raw.nome,
      email: raw.email,
      contato: raw.contato || undefined,
      tipoPessoa: raw.tipoPessoa as TipoPessoa,
      documento: raw.documento,
      status: raw.status as StatusPessoa,
      cep: raw.cep || undefined,
      uf: raw.uf || undefined,
      cidade: raw.cidade || undefined,
      logradouro: raw.logradouro || undefined,
      numero: raw.numero || undefined,
      bairro: raw.bairro || undefined,
      observacao: raw.observacao || undefined,
      usuarioId: raw.usuarioId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt || undefined,
      deletedAt: raw.deletedAt || undefined,
    });
  }

  static toPersistence(entity: ClienteEntity) {
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
  }
}

@Injectable()
export class PrismaClienteRepository implements IClienteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criar(cliente: ClienteEntity): Promise<ClienteEntity> {
    const data = ClienteMapper.toPersistence(cliente);
    const created = await this.prisma.cliente.create({ data });
    return ClienteMapper.toDomain(created);
  }

  async buscarPorId(id: number): Promise<ClienteEntity | null> {
    const raw = await this.prisma.cliente.findFirst({
      where: { id, deletedAt: null },
    });
    if (!raw) return null;
    return ClienteMapper.toDomain(raw);
  }

  async listarPorUsuario(usuarioId: number): Promise<ClienteEntity[]> {
    const list = await this.prisma.cliente.findMany({
      where: { usuarioId, deletedAt: null },
      orderBy: { id: 'asc' },
    });
    return list.map(ClienteMapper.toDomain);
  }

  async atualizar(id: number, cliente: Partial<ClienteEntity>): Promise<ClienteEntity> {
    const updateData: any = {};
    if (cliente.nome !== undefined) updateData.nome = cliente.nome;
    if (cliente.email !== undefined) updateData.email = cliente.email;
    if (cliente.contato !== undefined) updateData.contato = cliente.contato;
    if (cliente.tipoPessoa !== undefined) updateData.tipoPessoa = cliente.tipoPessoa;
    if (cliente.documento !== undefined) updateData.documento = cliente.documento;
    if (cliente.status !== undefined) updateData.status = cliente.status;
    if (cliente.cep !== undefined) updateData.cep = cliente.cep;
    if (cliente.uf !== undefined) updateData.uf = cliente.uf;
    if (cliente.cidade !== undefined) updateData.cidade = cliente.cidade;
    if (cliente.logradouro !== undefined) updateData.logradouro = cliente.logradouro;
    if (cliente.numero !== undefined) updateData.numero = cliente.numero;
    if (cliente.bairro !== undefined) updateData.bairro = cliente.bairro;
    if (cliente.observacao !== undefined) updateData.observacao = cliente.observacao;
    if (cliente.updatedAt !== undefined) updateData.updatedAt = cliente.updatedAt;

    const updated = await this.prisma.cliente.update({
      where: { id },
      data: updateData,
    });
    return ClienteMapper.toDomain(updated);
  }

  async deletarSoft(id: number): Promise<void> {
    await this.prisma.cliente.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
