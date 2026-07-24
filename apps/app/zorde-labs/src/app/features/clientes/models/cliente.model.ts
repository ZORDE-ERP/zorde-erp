export type TipoPessoa = 'FISICA' | 'JURIDICA';
export type StatusPessoa = 'ATIVO' | 'INATIVO';

export interface Cliente {
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
	numero?: string | null;
	bairro?: string | null;
	ibge?: string | null;
	observacao?: string | null;
	numeroEndereco?: string | null;
	usuarioId: number;
	qrCodeUrl?: string | null;
	qrGeradoEm?: string | Date | null;
	createdAt: string | Date | null;
	updatedAt?: string | Date | null;
}

export interface CreateClientePayload {
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
	qrCodeInfo?: string;
}

export interface UpdateClientePayload {
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

export interface ClienteQrCodeResponse {
	clienteId: number;
	token: string;
	qrGeradoEm: string | Date;
	qrCodeUrl: string;
	message: string;
}

export interface TabelaMontagemPorQrItem {
	id: number;
	servicoId: number;
	nomeServico: string | null;
	valor: number;
}

export interface TabelaMontagemPorQrResponse {
	clienteId: number;
	itens: TabelaMontagemPorQrItem[];
}
