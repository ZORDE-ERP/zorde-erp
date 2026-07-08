import type { UsuarioEntity } from '../../domain/entities/usuario.entity';
import type { UsuarioResponseDto } from '../dtos/usuarioResponse.dto';

export function usuarioToResponse(entity: UsuarioEntity): UsuarioResponseDto {
	return {
		id: entity.getId() as number,
		email: entity.getEmail(),
		nome: entity.getNome(),
		documento: entity.getDocumento(),
		contato: entity.getContato(),
		senha: entity.getSenha() as string,
		ativo: entity.getAtivo() as boolean,
		tipoUsuario: entity.getTipoUsuario(),
		ultimoAcesso: entity.getUltimoAcesso(),
		createdAt: entity.getCreatedAt() as Date,
		updatedAt: entity.getUpdatedAt(),
	};
}

export function usuariosToResponse(entities: UsuarioEntity[]): UsuarioResponseDto[] {
	return entities.map(usuarioToResponse);
}
