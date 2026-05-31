import { ClienteEntity } from '../entities/cliente.entity';

export const I_CLIENTE_REPOSITORY = 'IClienteRepository';

export interface IClienteRepository {
  criar(cliente: ClienteEntity): Promise<ClienteEntity>;
  buscarPorId(id: number): Promise<ClienteEntity | null>;
  listarPorUsuario(usuarioId: number): Promise<ClienteEntity[]>;
  atualizar(id: number, cliente: Partial<ClienteEntity>): Promise<ClienteEntity>;
  deletarSoft(id: number): Promise<void>;
}
