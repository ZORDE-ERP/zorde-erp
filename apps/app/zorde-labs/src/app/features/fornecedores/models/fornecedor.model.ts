export type TipoPessoa = 'FISICA' | 'JURIDICA';
export type StatusPessoa = 'ATIVO' | 'INATIVO';

export interface Fornecedor {
	id: number;
	nome: string;
	email: string;
	contato?: string | null;
	tipoPessoa: TipoPessoa;
	razaoSocial?: string | null;
	nomeFantasia?: string | null;
	documento: string;
	status: StatusPessoa;
	cep?: string | null;
	uf?: string | null;
	cidade?: string | null;
	logradouro?: string | null;
	complemento?: string | null;
	bairro?: string | null;
	ibge?: string | null;
	observacao?: string | null;
	numeroEndereco?: string | null;
	usuarioId: number;
	logoUrl?: string | null;
	createdAt: string | Date | null;
	updatedAt?: string | Date | null;
}

export interface CreateFornecedorPayload {
	nome: string;
	email: string;
	tipoPessoa: TipoPessoa;
	documento: string;
	status?: StatusPessoa;
	contato?: string;
	razaoSocial?: string;
	nomeFantasia?: string;
	cep?: string;
	uf?: string;
	cidade?: string;
	logradouro?: string;
	numero?: string;
	complemento?: string;
	bairro?: string;
	ibge?: string;
	observacao?: string;
	numeroEndereco?: string;
}

export interface UpdateFornecedorPayload {
	id: number;
	nome?: string;
	email?: string;
	contato?: string;
	tipoPessoa?: TipoPessoa;
	documento?: string;
	status?: StatusPessoa;
	cep?: string;
	uf?: string;
	cidade?: string;
	logradouro?: string;
	numero?: string;
	bairro?: string;
	observacao?: string;
	numeroEndereco?: string;
	complemento?: string;
	ibge?: string;
	razaoSocial?: string;
	nomeFantasia?: string;
}

export interface FornecedorStatusCounts {
	total: number;
	ativos: number;
	inativos: number;
}

export interface FornecedorListResponse {
	items: Fornecedor[];
	total: number;
	counts: FornecedorStatusCounts;
}

export interface ListFornecedoresQuery {
	page?: number;
	limit?: number;
	search?: string;
	status?: StatusPessoa;
}
