import type { ClienteEntity } from '../entities/cliente.entity';

export const ICLIENTE_REPOSITORY = 'IClienteRepository';

export interface IClienteRepository {
	create(cliente: ClienteEntity): Promise<ClienteEntity>;
	findById(id: number, usuarioId: number): Promise<ClienteEntity | null>;
	findByUsuarioId(usuarioId: number): Promise<ClienteEntity[]>;
	update(client: ClienteEntity): Promise<ClienteEntity>;
	softDelete(id: number, usuarioId: number): Promise<void>;
}
