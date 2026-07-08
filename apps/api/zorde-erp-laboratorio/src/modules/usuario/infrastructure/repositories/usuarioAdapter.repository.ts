import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { UsuarioEntity, type UsuarioProps } from '../../domain/entities/usuario.entity';
import type { IUsuarioRepository } from '../../domain/repositories/i-usuario.repository';
import { UsuarioInfraMapper } from '../mappers/usuarioInfra.mapper';

@Injectable()
export class PrismaUsuarioRepository implements IUsuarioRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async criar(usuario: UsuarioEntity): Promise<UsuarioEntity> {
		const data = UsuarioInfraMapper.toPersistence(usuario);
		const created = await this.prisma.usuario.create({
			data: {
				...data,
				createdAt: new Date(),
			},
		});
		return UsuarioInfraMapper.toDomain(created);
	}

	public async buscarPorId(id: number): Promise<UsuarioEntity | null> {
		const raw = await this.prisma.usuario.findUnique({ where: { id } });
		if (!raw) return null;
		return UsuarioInfraMapper.toDomain(raw);
	}

	public async buscarPorEmail(email: string): Promise<UsuarioEntity | null> {
		const raw = await this.prisma.usuario.findUnique({
			where: { email, AND: { ativo: true } },
		});
		if (!raw) return null;
		return UsuarioInfraMapper.toDomain(raw);
	}

	public async buscarPorDocumento(documento: string): Promise<UsuarioEntity | null> {
		const raw = await this.prisma.usuario.findUnique({
			where: { documento, AND: { ativo: true } },
		});
		if (!raw) return null;
		return UsuarioInfraMapper.toDomain(raw);
	}

	public async atualizar(id: number, usuario: Partial<UsuarioProps>): Promise<UsuarioEntity> {
		const updated = await this.prisma.usuario.update({
			where: { id },
			data: {
				ativo: usuario.ativo,
				contato: usuario.contato,
				documento: usuario.documento,
				email: usuario.email,
				nome: usuario.nome,
				senha: usuario.senha,
				ultimoAcesso: usuario.ultimoAcesso,
				updatedAt: new Date(),
				tipoUsuario: usuario.tipoUsuario,
			},
		});
		return UsuarioInfraMapper.toDomain(updated);
	}

	public async deletar(id: number): Promise<void> {
		await this.prisma.usuario.delete({ where: { id } });
	}
}
