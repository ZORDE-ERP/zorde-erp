import { AutenticacaoEntity } from '../entities/autenticacao.entity';
import { StatusSessao } from '../../../../shared/enums/status-sessao.enum';

export const I_AUTENTICACAO_REPOSITORY = 'IAutenticacaoRepository';

export interface IAutenticacaoRepository {
  criar(autenticacao: AutenticacaoEntity): Promise<AutenticacaoEntity>;
  buscarPorRefreshToken(refreshToken: string): Promise<AutenticacaoEntity | null>;
  atualizarStatus(id: number, status: StatusSessao): Promise<void>;
  deletarPorUsuario(idUsuario: number): Promise<void>;
}
