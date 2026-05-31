import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { IFornecedorRepository } from '../../domain/repositories/i-fornecedor.repository';
import { FornecedorEntity } from '../../domain/entities/fornecedor.entity';
import { Fornecedor } from '@prisma/client';
import { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';
import { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';

class FornecedorMapper {
  static toDomain(raw: Fornecedor): FornecedorEntity {
    return new FornecedorEntity({
      id: raw.id,
      nome: raw.nome,
      email: raw.email,
      contato: raw.contato || undefined,
      tipoPessoa: raw.tipo_pessoa as TipoPessoa,
      documento: raw.documento,
      status: raw.status as StatusPessoa,
      cep: raw.cep || undefined,
      uf: raw.uf || undefined,
      cidade: raw.cidade || undefined,
      logradouro: raw.logradouro || undefined,
      numero: raw.numero || undefined,
      bairro: raw.bairro || undefined,
      observacao: raw.observacao || undefined,
      usuarioId: raw.usuario_id,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at || undefined,
      deletedAt: raw.deleted_at || undefined,
    });
  }

  static toPersistence(entity: FornecedorEntity) {
    return {
      nome: entity.nome,
      email: entity.email,
      contato: entity.contato,
      tipo_pessoa: entity.tipoPessoa,
      documento: entity.documento,
      status: entity.status,
      cep: entity.cep,
      uf: entity.uf,
      cidade: entity.cidade,
      logradouro: entity.logradouro,
      numero: entity.numero,
      bairro: entity.bairro,
      observacao: entity.observacao,
      usuario_id: entity.usuarioId,
      created_at: entity.createdAt,
    };
  }
}

@Injectable()
export class PrismaFornecedorRepository implements IFornecedorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criar(fornecedor: FornecedorEntity): Promise<FornecedorEntity> {
    const data = FornecedorMapper.toPersistence(fornecedor);
    const created = await this.prisma.fornecedor.create({ data });
    return FornecedorMapper.toDomain(created);
  }

  async buscarPorId(id: number): Promise<FornecedorEntity | null> {
    const raw = await this.prisma.fornecedor.findFirst({
      where: { id, deleted_at: null },
    });
    if (!raw) return null;
    return FornecedorMapper.toDomain(raw);
  }

  async listarPorUsuario(usuarioId: number): Promise<FornecedorEntity[]> {
    const list = await this.prisma.fornecedor.findMany({
      where: { usuario_id: usuarioId, deleted_at: null },
      orderBy: { id: 'asc' },
    });
    return list.map(FornecedorMapper.toDomain);
  }

  async atualizar(id: number, fornecedor: Partial<FornecedorEntity>): Promise<FornecedorEntity> {
    const updateData: any = {};
    if (fornecedor.nome !== undefined) updateData.nome = fornecedor.nome;
    if (fornecedor.email !== undefined) updateData.email = fornecedor.email;
    if (fornecedor.contato !== undefined) updateData.contato = fornecedor.contato;
    if (fornecedor.tipoPessoa !== undefined) updateData.tipo_pessoa = fornecedor.tipoPessoa;
    if (fornecedor.documento !== undefined) updateData.documento = fornecedor.documento;
    if (fornecedor.status !== undefined) updateData.status = fornecedor.status;
    if (fornecedor.cep !== undefined) updateData.cep = fornecedor.cep;
    if (fornecedor.uf !== undefined) updateData.uf = fornecedor.uf;
    if (fornecedor.cidade !== undefined) updateData.cidade = fornecedor.cidade;
    if (fornecedor.logradouro !== undefined) updateData.logradouro = fornecedor.logradouro;
    if (fornecedor.numero !== undefined) updateData.numero = fornecedor.numero;
    if (fornecedor.bairro !== undefined) updateData.bairro = fornecedor.bairro;
    if (fornecedor.observacao !== undefined) updateData.observacao = fornecedor.observacao;
    if (fornecedor.updatedAt !== undefined) updateData.updated_at = fornecedor.updatedAt;

    const updated = await this.prisma.fornecedor.update({
      where: { id },
      data: updateData,
    });
    return FornecedorMapper.toDomain(updated);
  }

  async deletarSoft(id: number): Promise<void> {
    await this.prisma.fornecedor.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
