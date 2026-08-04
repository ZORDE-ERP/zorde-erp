export interface Servico {
	id: number;
	usuarioId: number;
	nome: string;
	descricao?: string | null;
	createdAt: string | Date | null;
	updatedAt?: string | Date | null;
}

export interface CreateServicoPayload {
	nome: string;
	descricao?: string;
}

export interface UpdateServicoPayload {
	nome?: string;
	descricao?: string;
}

export interface ServicoListResponse {
	items: Servico[];
	total: number;
}

export type Service = Servico;
