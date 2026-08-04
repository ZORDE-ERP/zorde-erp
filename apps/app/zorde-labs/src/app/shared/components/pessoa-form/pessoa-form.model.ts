export interface PessoaFormValue {
	nome: string;
	email: string;
	contato: string;
	tipoPessoa: 'FISICA' | 'JURIDICA';
	documento: string;
	status: 'ATIVO' | 'INATIVO';
	razaoSocial: string;
	nomeFantasia: string;
	cep: string;
	uf: string;
	cidade: string;
	logradouro: string;
	numero: string;
	complemento: string;
	bairro: string;
	ibge: string;
	observacao: string;
	numeroEndereco: string;
}

export const EMPTY_PESSOA_FORM_VALUE: PessoaFormValue = {
	nome: '',
	email: '',
	contato: '',
	tipoPessoa: 'FISICA',
	documento: '',
	status: 'ATIVO',
	razaoSocial: '',
	nomeFantasia: '',
	cep: '',
	uf: '',
	cidade: '',
	logradouro: '',
	numero: '',
	complemento: '',
	bairro: '',
	ibge: '',
	observacao: '',
	numeroEndereco: '',
};
