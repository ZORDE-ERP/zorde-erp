import type { StatusOrdemServico } from '../models/ordem-servico.model';

export interface OrdemServicoFiltroModel {
	status: StatusOrdemServico | '';
	clienteId: number | null;
	dataInicio: string;
	dataFim: string;
}
