import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { IAutenticacaoRepository } from '../../domain/repositories/i-autenticacao.repository';
import { AutenticacaoEntity } from '../../domain/entities/autenticacao.entity';
import { StatusSessao } from '../../../../shared/enums/status-sessao.enum';
import { Autenticacao } from '@prisma/client';

class AutenticacaoMapper {
  static toDomain(raw: Autenticacao): AutenticacaoEntity {
    return new AutenticacaoEntity({
      id: raw.id,
      idUsuario: raw.id_usuario,
      refreshToken: raw.refresh_token,
      status: raw.status as StatusSessao,
      ip: raw.ip,
      dispositivo: raw.dispositivo,
      navegador: raw.navegador,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at || undefined,
    });
  }

  static toPersistence(entity: AutenticacaoEntity) {
    return {
      id_usuario: entity.idUsuario,
      refresh_token: entity.refreshToken,
      status: entity.status,
      ip: entity.ip,
      dispositivo: entity.dispositivo,
      navegador: entity.navegador,
      created_at: entity.createdAt,
    };
  }
}

@Injectable()
export class PrismaAutenticacaoRepository implements IAutenticacaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criar(autenticacao: AutenticacaoEntity): Promise<AutenticacaoEntity> {
    const raw = AutenticacaoMapper.toPersistence(autenticacao);
    const created = await this.prisma.autenticacao.create({
      data: raw,
    });
    return AutenticacaoMapper.toDomain(created);
  }

  async buscarPorRefreshToken(refreshToken: string): Promise<AutenticacaoEntity | null> {
    const raw = await this.prisma.autenticacao.findUnique({
      where: { refresh_token: refreshToken },
    });
    if (!raw) return null;
    return AutenticacaoMapper.toDomain(raw);
  }

  async atualizarStatus(id: number, status: StatusSessao): Promise<void> {
    await this.prisma.autenticacao.update({
      where: { id },
      data: { status },
    });
  }

  async deletarPorUsuario(idUsuario: number): Promise<void> {
    await this.prisma.autenticacao.deleteMany({
      where: { id_usuario: idUsuario },
    });
  }
}
