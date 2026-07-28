export type ClienteFiltroStatus = '' | 'ATIVO' | 'INATIVO';

export interface ClienteFiltroModel {
	nome: string;
	status: ClienteFiltroStatus;
}
