import type { UsuarioEntity, UsuarioProps } from '../entities/usuario.entity';

export const IUSUARIO_REPOSITORY = 'IUsuarioRepository';

export interface IUsuarioRepository {
	criar(usuario: UsuarioEntity): Promise<UsuarioEntity>;
	buscarPorId(id: number): Promise<UsuarioEntity | null>;
	buscarPorEmail(email: string): Promise<UsuarioEntity | null>;
	buscarPorDocumento(documento: string): Promise<UsuarioEntity | null>;
	atualizar(id: number, usuario: Partial<UsuarioProps>): Promise<UsuarioEntity>;
	deletar(id: number): Promise<void>;
}
