import type { ClienteEntity } from '../entities/cliente.entity';

export const ICLIENTE_REPOSITORY = 'IClienteRepository';

export interface UpdateQrCodeData {
	qrToken: string;
	qrGeradoEm: Date;
	qrCodeUrl: string;
	qrCodePublicId: string;
}

export interface UpdateLogoData {
	logoUrl: string | null;
	logoPublicId: string | null;
}

export interface ListClientesParams {
	page: number;
	limit: number;
	search?: string;
	status?: string;
	id?: number;
	usuarioId: number;
}

export interface ClienteStatusCounts {
	total: number;
	ativos: number;
	inativos: number;
}

export interface IClienteRepository {
	create(cliente: ClienteEntity): Promise<ClienteEntity>;
	findById(id: number, usuarioId: number): Promise<ClienteEntity | null>;
	findByUsuarioId(usuarioId: number): Promise<ClienteEntity[]>;
	findAllPaginated(params: ListClientesParams): Promise<{ items: ClienteEntity[]; total: number }>;
	countByStatus(usuarioId: number): Promise<ClienteStatusCounts>;
	update(client: ClienteEntity): Promise<ClienteEntity>;
	updateQrToken(id: number, usuarioId: number, qrToken: string, qrGeradoEm: Date): Promise<ClienteEntity>;
	updateQrCode(id: number, usuarioId: number, data: UpdateQrCodeData): Promise<ClienteEntity>;
	updateLogo(id: number, usuarioId: number, data: UpdateLogoData): Promise<ClienteEntity>;
	softDelete(id: number, usuarioId: number): Promise<void>;
}
