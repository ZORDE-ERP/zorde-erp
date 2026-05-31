import { UsuarioEntity } from '../entities/usuario.entity';

export const I_USUARIO_REPOSITORY = 'IUsuarioRepository';

export interface IUsuarioRepository {
  criar(usuario: UsuarioEntity): Promise<UsuarioEntity>;
  buscarPorId(id: number): Promise<UsuarioEntity | null>;
  buscarPorEmail(email: string): Promise<UsuarioEntity | null>;
  buscarPorDocumento(documento: string): Promise<UsuarioEntity | null>;
  listar(): Promise<UsuarioEntity[]>;
  atualizar(id: number, usuario: Partial<UsuarioEntity>): Promise<UsuarioEntity>;
  deletar(id: number): Promise<void>;
}
