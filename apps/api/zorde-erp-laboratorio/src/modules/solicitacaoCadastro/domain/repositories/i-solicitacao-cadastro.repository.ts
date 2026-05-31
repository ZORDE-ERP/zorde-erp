import { SolicitacaoCadastroEntity } from '../entities/solicitacao-cadastro.entity';

export const I_SOLICITACAO_CADASTRO_REPOSITORY = 'ISolicitacaoCadastroRepository';

export interface ISolicitacaoCadastroRepository {
  criar(solicitacao: SolicitacaoCadastroEntity): Promise<SolicitacaoCadastroEntity>;
  buscarPorEmail(email: string): Promise<SolicitacaoCadastroEntity | null>;
  deletarPorEmail(email: string): Promise<void>;
}
