import { TabelaMontagemEntity } from '../entities/tabela-montagem.entity';

export const I_TABELA_MONTAGEM_REPOSITORY = 'ITabelaMontagemRepository';

export interface ITabelaMontagemRepository {
  criar(tabela: TabelaMontagemEntity): Promise<TabelaMontagemEntity>;
  buscarPorId(id: number): Promise<TabelaMontagemEntity | null>;
  listarPaginado(params: { page: number; limit: number; search?: string; usuarioId: number }): Promise<{ items: TabelaMontagemEntity[]; total: number }>;
  atualizar(id: number, tabela: Partial<TabelaMontagemEntity>): Promise<TabelaMontagemEntity>;
  deletarSoft(id: number): Promise<void>;
}
