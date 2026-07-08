import type { Usuario } from '@prisma/client';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';

export class UsuarioInfraMapper {
	public static toDomain(raw: Usuario): UsuarioEntity {
		return new UsuarioEntity({
			id: raw.id,
			email: raw.email,
			senha: raw.senha,
			nome: raw.nome,
			documento: raw.documento,
			contato: raw.contato,
			tipoUsuario: raw.tipoUsuario,
			ultimoAcesso: raw.ultimoAcesso,
			ativo: raw.ativo,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
			deletedAt: raw.deletedAt,
		});
	}

	public static toPersistence(entity: UsuarioEntity): {
		email: string;
		senha: string;
		nome: string;
		documento: string;
		contato: string;
		tipoUsuario: 'ADMIN' | 'USUARIO';
	} {
		return {
			email: entity.getEmail(),
			senha: entity.getSenha() as string,
			nome: entity.getNome(),
			documento: entity.getDocumento(),
			contato: entity.getContato(),
			tipoUsuario: entity.getTipoUsuario(),
		};
	}
}
