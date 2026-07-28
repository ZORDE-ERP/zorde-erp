import type { TabelaMontagemEntity } from '../entities/tabelaMontagem.entity';

export const ITABELA_MONTAGEM_REPOSITORY = 'ITabelaMontagemRepository';

export interface ITabelaMontagemRepository {
	create(tabela: TabelaMontagemEntity): Promise<TabelaMontagemEntity>;
	findById(id: number, usuarioId: number): Promise<TabelaMontagemEntity | null>;
	findByClienteId(clienteId: number, usuarioId: number): Promise<TabelaMontagemEntity[]>;
	findByIds(ids: number[], usuarioId: number): Promise<TabelaMontagemEntity[]>;
	findAllPaginated(params: {
		page: number;
		limit: number;
		search?: string;
		clienteId?: number;
		usuarioId: number;
	}): Promise<{ items: TabelaMontagemEntity[]; total: number }>;
	update(tabela: TabelaMontagemEntity): Promise<TabelaMontagemEntity>;
	deleteById(id: number, usuarioId: number): Promise<void>;
}
