import type { ServicoEntity } from '../entities/servico.entity';

export const ISERVICO_REPOSITORY = 'IServicoRepository';

export interface IServicoRepository {
	create(servico: ServicoEntity): Promise<ServicoEntity>;
	findById(id: number, usuarioId: number): Promise<ServicoEntity | null>;
	findAllPaginated(params: {
		page: number;
		limit: number;
		search?: string;
		usuarioId: number;
	}): Promise<{ items: ServicoEntity[]; total: number }>;
	update(servico: ServicoEntity): Promise<ServicoEntity>;
	delete(id: number, usuarioId: number): Promise<void>;
}
