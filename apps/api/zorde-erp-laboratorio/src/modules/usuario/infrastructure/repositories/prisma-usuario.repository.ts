import { Injectable } from '@nestjs/common';
import type { Usuario } from '@prisma/client';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { UsuarioEntity, type UsuarioProps } from '../../domain/entities/usuario.entity';
import type { IUsuarioRepository } from '../../domain/repositories/i-usuario.repository';

const UsuarioMapper = {
	toDomain(raw: Usuario): UsuarioEntity {
		const { id, email, senha, nome, documento, contato, tipoUsuario, ultimoAcesso, createdAt, updatedAt, ativo, deletedAt } =
			raw;
		return new UsuarioEntity({
			id,
			email,
			senha,
			nome,
			documento,
			contato,
			tipoUsuario,
			ultimoAcesso,
			ativo,
			createdAt,
			updatedAt,
			deletedAt,
		});
	},
};

@Injectable()
export class PrismaUsuarioRepository implements IUsuarioRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async criar(usuario: UsuarioEntity): Promise<UsuarioEntity> {
		const created = await this.prisma.usuario.create({
			data: {
				email: usuario.getEmail(),
				contato: usuario.getContato(),
				documento: usuario.getDocumento(),
				nome: usuario.getNome(),
				senha: usuario.getSenha() as string,
				tipoUsuario: usuario.getTipoUsuario(),
				createdAt: new Date(),
			},
		});
		return UsuarioMapper.toDomain(created);
	}

	public async buscarPorId(id: number): Promise<UsuarioEntity | null> {
		const raw = await this.prisma.usuario.findUnique({
			where: { id },
		});
		if (!raw) return null;
		return UsuarioMapper.toDomain(raw);
	}

	public async buscarPorEmail(email: string): Promise<UsuarioEntity | null> {
		const raw = await this.prisma.usuario.findUnique({
			where: { email, AND: { ativo: true } },
		});
		if (!raw) return null;
		return UsuarioMapper.toDomain(raw);
	}

	public async buscarPorDocumento(documento: string): Promise<UsuarioEntity | null> {
		const raw = await this.prisma.usuario.findUnique({
			where: { documento, AND: { ativo: true } },
		});
		if (!raw) return null;
		return UsuarioMapper.toDomain(raw);
	}

	public async listar(): Promise<UsuarioEntity[]> {
		const list = await this.prisma.usuario.findMany({
			orderBy: { createdAt: 'desc' },
		});
		return list.map(UsuarioMapper.toDomain);
	}

	public async atualizar(id: number, usuario: Partial<UsuarioProps>): Promise<UsuarioEntity> {
		const updateData: Record<string, unknown> = {};
		if (usuario.nome !== undefined) updateData.nome = usuario.nome;
		if (usuario.email !== undefined) updateData.email = usuario.email;
		if (usuario.senha !== undefined) updateData.senha = usuario.senha;
		if (usuario.documento !== undefined) updateData.documento = usuario.documento;
		if (usuario.contato !== undefined) updateData.contato = usuario.contato;
		if (usuario.ultimoAcesso !== undefined) updateData.ultimoAcesso = usuario.ultimoAcesso;
		if (usuario.updatedAt !== undefined) updateData.updatedAt = usuario.updatedAt;

		const updated = await this.prisma.usuario.update({
			where: { id },
			data: updateData,
		});
		return UsuarioMapper.toDomain(updated);
	}

	public async deletar(id: number): Promise<void> {
		await this.prisma.usuario.delete({
			where: { id },
		});
	}
}
