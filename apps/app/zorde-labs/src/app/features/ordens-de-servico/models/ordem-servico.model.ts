export type StatusOrdemServico = 'LANCADA' | 'FATURADA' | 'CANCELADA';
export type OrigemOrdemServico = 'MANUAL' | 'QR_SCAN';
export type OrigemValorItem = 'TABELA' | 'MANUAL';

export interface OrdemServicoItem {
	id: number;
	tabelaMontagemId?: number | null;
	descricaoManual?: string | null;
	quantidade: number;
	valorUnitario: number;
	valorTotal: number;
	origemValor: OrigemValorItem;
	nomeServico?: string | null;
}

export interface OrdemServico {
	id: number;
	codigoOs: string;
	clienteId: number;
	usuarioId: number;
	valorTotal: number;
	status: StatusOrdemServico;
	origem: OrigemOrdemServico;
	observacao?: string | null;
	createdAt: string | Date | null;
	updatedAt?: string | Date | null;
	cliente?: { id: number; nome: string } | null;
	itens: OrdemServicoItem[];
}

export interface CreateOrdemServicoItemPayload {
	tabelaMontagemId?: number | null;
	descricaoManual?: string | null;
	quantidade: number;
	valorUnitario: number;
	origemValor?: OrigemValorItem;
}

export interface CreateOrdemServicoPayload {
	clienteId: number;
	origem?: OrigemOrdemServico;
	codigoOS?: string;
	observacao?: string;
	folhaId?: number;
	codigoFolha?: string;
	itens: CreateOrdemServicoItemPayload[];
}

export interface UpdateOrdemServicoPayload {
	id: number;
	codigoOS?: string;
	observacao?: string | null;
	status?: StatusOrdemServico;
}

export interface ListOrdensQuery {
	page?: number;
	limit?: number;
	status?: StatusOrdemServico;
	clienteId?: number;
	dataInicio?: string;
	dataFim?: string;
}

export interface OrdemServicoListResponse {
	items: OrdemServico[];
	total: number;
}
