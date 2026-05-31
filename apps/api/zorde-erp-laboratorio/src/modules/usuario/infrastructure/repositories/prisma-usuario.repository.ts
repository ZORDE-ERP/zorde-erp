import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { IUsuarioRepository } from '../../domain/repositories/i-usuario.repository';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { Usuario } from '@prisma/client';

class UsuarioMapper {
  static toDomain(raw: Usuario): UsuarioEntity {
    return new UsuarioEntity({
      id: raw.id,
      email: raw.email,
      senha: raw.senha,
      nome: raw.nome,
      documento: raw.documento,
      contato: raw.contato,
      ultimoAcesso: raw.ultimo_acesso,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }

  static toPersistence(entity: UsuarioEntity) {
    return {
      email: entity.email,
      senha: entity.senha || '',
      nome: entity.nome,
      documento: entity.documento,
      contato: entity.contato,
      ultimo_acesso: entity.ultimoAcesso,
      created_at: entity.createdAt,
    };
  }
}

@Injectable()
export class PrismaUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criar(usuario: UsuarioEntity): Promise<UsuarioEntity> {
    const raw = UsuarioMapper.toPersistence(usuario);
    const created = await this.prisma.usuario.create({
      data: raw,
    });
    return UsuarioMapper.toDomain(created);
  }

  async buscarPorId(id: number): Promise<UsuarioEntity | null> {
    const raw = await this.prisma.usuario.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return UsuarioMapper.toDomain(raw);
  }

  async buscarPorEmail(email: string): Promise<UsuarioEntity | null> {
    const raw = await this.prisma.usuario.findUnique({
      where: { email },
    });
    if (!raw) return null;
    return UsuarioMapper.toDomain(raw);
  }

  async buscarPorDocumento(documento: string): Promise<UsuarioEntity | null> {
    const raw = await this.prisma.usuario.findUnique({
      where: { documento },
    });
    if (!raw) return null;
    return UsuarioMapper.toDomain(raw);
  }

  async listar(): Promise<UsuarioEntity[]> {
    const list = await this.prisma.usuario.findMany({
      orderBy: { created_at: 'desc' },
    });
    return list.map(UsuarioMapper.toDomain);
  }

  async atualizar(id: number, usuario: Partial<UsuarioEntity>): Promise<UsuarioEntity> {
    const updateData: any = {};
    if (usuario.nome !== undefined) updateData.nome = usuario.nome;
    if (usuario.email !== undefined) updateData.email = usuario.email;
    if (usuario.senha !== undefined) updateData.senha = usuario.senha;
    if (usuario.documento !== undefined) updateData.documento = usuario.documento;
    if (usuario.contato !== undefined) updateData.contato = usuario.contato;
    if (usuario.ultimoAcesso !== undefined) updateData.ultimo_acesso = usuario.ultimoAcesso;
    if (usuario.updatedAt !== undefined) updateData.updated_at = usuario.updatedAt;

    const updated = await this.prisma.usuario.update({
      where: { id },
      data: updateData,
    });
    return UsuarioMapper.toDomain(updated);
  }

  async deletar(id: number): Promise<void> {
    await this.prisma.usuario.delete({
      where: { id },
    });
  }
}
