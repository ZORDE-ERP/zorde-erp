import type { TabelaMontagemEntity } from '../entities/tabelaMontagem.entity';

export const ITABELA_MONTAGEM_REPOSITORY = 'ITabelaMontagemRepository';

export interface ITabelaMontagemRepository {
	create(tabela: TabelaMontagemEntity): Promise<TabelaMontagemEntity>;
	findById(id: number, usuarioId: number): Promise<TabelaMontagemEntity | null>;
	findAllPaginated(params: {
		page: number;
		limit: number;
		search?: string;
		usuarioId: number;
	}): Promise<{ items: TabelaMontagemEntity[]; total: number }>;
	update(tabela: TabelaMontagemEntity): Promise<TabelaMontagemEntity>;
	softDelete(id: number, usuarioId: number): Promise<void>;
}
