package models

type TipoPessoa string

const (
	TipoPessoaFisica   TipoPessoa = "FISICA"
	TipoPessoaJuridica TipoPessoa = "JURIDICA"
)

type StatusPessoa string

const (
	StatusPessoaAtivo   StatusPessoa = "ATIVO"
	StatusPessoaInativo StatusPessoa = "INATIVO"
)

type TipoServico string

const (
	TipoServicoMontagemSimples TipoServico = "MONTAGEM SIMPLES"
	TipoServicoParafuso        TipoServico = "PARAFUSO"
	TipoServicoTransposicao    TipoServico = "TRANSPOSICAO"
	TipoServicoColoracao       TipoServico = "COLORACAO"
	TipoServicoSomenteEncaixar TipoServico = "SOMENTE ENCAIXAR"
)
