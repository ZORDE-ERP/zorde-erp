import type { FornecedorEntity } from '../entities/fornecedor.entity';

export const IFORNECEDOR_REPOSITORY = 'IFornecedorRepository';

export interface UpdateFornecedorLogoData {
	logoUrl: string | null;
	logoPublicId: string | null;
}

export interface ListFornecedoresParams {
	page: number;
	limit: number;
	search?: string;
	status?: string;
	usuarioId: number;
}

export interface FornecedorStatusCounts {
	total: number;
	ativos: number;
	inativos: number;
}

export interface IFornecedorRepository {
	create(fornecedor: FornecedorEntity): Promise<FornecedorEntity>;
	findById(id: number, usuarioId: number): Promise<FornecedorEntity | null>;
	findByUsuarioId(usuarioId: number): Promise<FornecedorEntity[]>;
	findAllPaginated(params: ListFornecedoresParams): Promise<{ items: FornecedorEntity[]; total: number }>;
	countByStatus(usuarioId: number): Promise<FornecedorStatusCounts>;
	update(fornecedor: FornecedorEntity): Promise<FornecedorEntity>;
	updateLogo(id: number, usuarioId: number, data: UpdateFornecedorLogoData): Promise<FornecedorEntity>;
	softDelete(id: number, usuarioId: number): Promise<void>;
}
