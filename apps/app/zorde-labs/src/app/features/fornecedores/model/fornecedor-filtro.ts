export type FornecedorFiltroStatus = '' | 'ATIVO' | 'INATIVO';

export interface FornecedorFiltroModel {
	nome: string;
	status: FornecedorFiltroStatus;
}
