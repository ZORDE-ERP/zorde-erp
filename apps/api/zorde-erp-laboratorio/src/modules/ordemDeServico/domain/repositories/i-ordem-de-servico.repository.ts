import type { OrdemDeServicoEntity } from '../entities/ordem-de-servico.entity';

export const I_ORDEM_DE_SERVICO_REPOSITORY = 'IOrdemDeServicoRepository';

export interface IOrdemDeServicoRepository {
	criar(ordem: OrdemDeServicoEntity): Promise<OrdemDeServicoEntity>;
	buscarPorId(id: number): Promise<OrdemDeServicoEntity | null>;
	listarPorUsuario(usuarioId: number): Promise<OrdemDeServicoEntity[]>;
	atualizar(id: number, ordem: Partial<OrdemDeServicoEntity>): Promise<OrdemDeServicoEntity>;
	deletarSoft(id: number): Promise<void>;
}
