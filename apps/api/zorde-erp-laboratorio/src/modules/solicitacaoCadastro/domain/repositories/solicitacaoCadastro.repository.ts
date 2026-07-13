import type { SolicitacaoCadastroEntity } from '../entities/solicitacaoCadastro.entity';

export const ISOLICITACAO_CADASTRO_REPOSITORY = 'ISolicitacaoCadastroRepository';

export interface ISolicitacaoCadastroRepository {
	criar(solicitacao: SolicitacaoCadastroEntity): Promise<SolicitacaoCadastroEntity>;
	buscarPorEmail(email: string): Promise<SolicitacaoCadastroEntity | null>;
	deletarPorEmail(email: string): Promise<void>;
}
