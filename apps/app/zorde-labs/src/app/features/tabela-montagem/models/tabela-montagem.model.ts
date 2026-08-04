export interface TabelaMontagem {
	id: number;
	clienteId: number;
	nomeCliente?: string | null;
	servicoId: number;
	nomeServico?: string | null;
	valor: number;
	createdAt: string | Date;
	updatedAt?: string | Date | null;
}

export interface CreateTabelaMontagemPayload {
	clienteId: number;
	servicoId: number;
	valor: number;
}

export interface UpdateTabelaMontagemPayload {
	clienteId?: number;
	servicoId?: number;
	valor?: number;
}

export interface TabelaMontagemListResponse {
	items: TabelaMontagem[];
	total: number;
}
