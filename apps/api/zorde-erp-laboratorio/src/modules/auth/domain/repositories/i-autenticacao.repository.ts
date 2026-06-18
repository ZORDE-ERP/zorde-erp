import { AutenticacaoEntity } from '../entities/autenticacao.entity';
import { StatusSessao } from '../../../../shared/enums/status-sessao.enum';

export const IAUTENTICACAO_REPOSITORY = 'IAutenticacaoRepository';

export interface IAutenticacaoRepository {
  criar(autenticacao: AutenticacaoEntity): Promise<AutenticacaoEntity>;
  atualizar(id: number, autenticacao:AutenticacaoEntity): Promise<AutenticacaoEntity>;
  buscarPorJti(jti: string): Promise<AutenticacaoEntity | null>;
  atualizarStatus(id: number, status: StatusSessao): Promise<void>;
  revogarRefreshToken(idUsuario: number): Promise<void>;
  deletarPorUsuario(idUsuario: number): Promise<void>;
}
