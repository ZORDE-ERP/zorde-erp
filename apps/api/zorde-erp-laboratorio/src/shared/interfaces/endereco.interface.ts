export interface Endereco {
	cep: string;
	uf?: string;
	cidade?: string;
	logradouro?: string;
	bairro?: string;
	complemento?: string;
	ibge?: string;
	createdAt?: Date;
	updatedAt?: Date;
}
