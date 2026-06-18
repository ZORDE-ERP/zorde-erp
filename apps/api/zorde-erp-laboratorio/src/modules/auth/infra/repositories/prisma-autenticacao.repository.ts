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
      idUsuario: raw.idUsuario,
      refreshToken: raw.refreshToken ?? null,
      status: StatusSessao.LOGADO,
      ip: raw.ip || undefined,
      dispositivo: raw.dispositivo || undefined,
      navegador: raw.navegador || undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt || undefined,
      jti: raw.jti || null,
    });
  }

  static toPersistence(entity: AutenticacaoEntity) {
    return {
      idUsuario: entity.getIdUsuario(),
      refreshToken: entity.getRefreshToken(),
      ip: entity.getIp(),
      dispositivo: entity.getDispositivo(),
      navegador: entity.getNavegador(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
      jti: entity.getJti(),
    };
  }
}

@Injectable()
export class PrismaAutenticacaoRepository implements IAutenticacaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async criar(autenticacao: AutenticacaoEntity): Promise<AutenticacaoEntity> {
    const raw = AutenticacaoMapper.toPersistence(autenticacao);
    const autenticationResult = await this.prisma.autenticacao.create({
      data: {
        refreshToken: raw.refreshToken,
        ip: raw.ip,
        dispositivo: raw.dispositivo,
        navegador: raw.navegador,
        createdAt: raw.createdAt ?? new Date(),
        updatedAt: raw.updatedAt,
        idUsuario: raw.idUsuario,
        jti: raw.jti,
      },
    });

    return AutenticacaoMapper.toDomain(autenticationResult);
  }

  public async atualizar(id: number, autenticacao: AutenticacaoEntity): Promise<AutenticacaoEntity> {
    const raw = AutenticacaoMapper.toPersistence(autenticacao);
    const autenticationResult = await this.prisma.autenticacao.update({
      where: { id },
      data: {
        refreshToken: raw.refreshToken,
        ip: raw.ip,
        dispositivo: raw.dispositivo,
        navegador: raw.navegador,
        updatedAt: raw.updatedAt,
        idUsuario: raw.idUsuario,
        jti: raw.jti,
      },
    });
    return AutenticacaoMapper.toDomain(autenticationResult);
  }

  public async buscarPorJti(jti: string): Promise<AutenticacaoEntity | null> {
    const raw = await this.prisma.autenticacao.findFirst({
      where: { jti },
    });
    if (!raw) return null;
    return AutenticacaoMapper.toDomain(raw);
  }

  async atualizarStatus(id: number, status: StatusSessao): Promise<void> {
    if (status === StatusSessao.OFFLINE) {
      await this.prisma.autenticacao.delete({
        where: { id },
      });
    }
  }

  public async deletarPorUsuario(idUsuario: number): Promise<void> {
    await this.prisma.autenticacao.deleteMany({
      where: { idUsuario },
    });
  }

  public async revogarRefreshToken(idUsuario: number): Promise<void> {
    await this.prisma.autenticacao.updateMany({
      where: { idUsuario },
      data: { refreshToken: null, jti: null },
    });
  }
}
