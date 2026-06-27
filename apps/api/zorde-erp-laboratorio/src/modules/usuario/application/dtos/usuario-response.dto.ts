import type { UsuarioEntity } from '../../domain/entities/usuario.entity';

export class UsuarioResponseDto {
	public id: number;
	public email: string;
	public nome: string;
	public documento: string;
	public contato: string;
	public senha?: string;
	public ativo: boolean;
	public tipoUsuario: 'ADMIN' | 'USUARIO';
	public ultimoAcesso: Date | null;
	public createdAt: Date;
	public updatedAt: Date | null;

	public static fromEntity(entity: UsuarioEntity): UsuarioResponseDto {
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

	public static fromEntities(entities: UsuarioEntity[]): UsuarioResponseDto[] {
		return entities.map(UsuarioResponseDto.fromEntity);
	}
}
