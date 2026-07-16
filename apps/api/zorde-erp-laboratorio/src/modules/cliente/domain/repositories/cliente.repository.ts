import type { ClienteEntity } from '../entities/cliente.entity';

export const ICLIENTE_REPOSITORY = 'IClienteRepository';

export interface UpdateQrCodeData {
	qrToken: string;
	qrGeradoEm: Date;
	qrCodeUrl: string;
	qrCodePublicId: string;
}

export interface IClienteRepository {
	create(cliente: ClienteEntity): Promise<ClienteEntity>;
	findById(id: number, usuarioId: number): Promise<ClienteEntity | null>;
	findByUsuarioId(usuarioId: number): Promise<ClienteEntity[]>;
	update(client: ClienteEntity): Promise<ClienteEntity>;
	updateQrToken(id: number, usuarioId: number, qrToken: string, qrGeradoEm: Date): Promise<ClienteEntity>;
	updateQrCode(id: number, usuarioId: number, data: UpdateQrCodeData): Promise<ClienteEntity>;
	softDelete(id: number, usuarioId: number): Promise<void>;
}
