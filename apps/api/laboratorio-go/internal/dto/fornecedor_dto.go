package dto

import "time"

type CreateFornecedorRequest struct {
	Nome       string  `json:"nome" validate:"required"`
	Email      string  `json:"email" validate:"required,email"`
	Contato    *string `json:"contato"`
	TipoPessoa string  `json:"tipoPessoa" validate:"required,oneof=FISICA JURIDICA"`
	Documento  string  `json:"documento" validate:"required"`
	Status     string  `json:"status" validate:"omitempty,oneof=ATIVO INATIVO"`
	CEP        *string `json:"cep"`
	UF         *string `json:"uf"`
	Cidade     *string `json:"cidade"`
	Logradouro *string `json:"logradouro"`
	Numero     *string `json:"numero"`
	Bairro     *string `json:"bairro"`
	Observacao *string `json:"observacao"`
	UsuarioID  uint    `json:"usuarioId" validate:"required"`
}

type UpdateFornecedorRequest struct {
	Nome       string  `json:"nome" validate:"required"`
	Email      string  `json:"email" validate:"required,email"`
	Contato    *string `json:"contato"`
	TipoPessoa string  `json:"tipoPessoa" validate:"required,oneof=FISICA JURIDICA"`
	Documento  string  `json:"documento" validate:"required"`
	Status     string  `json:"status" validate:"omitempty,oneof=ATIVO INATIVO"`
	CEP        *string `json:"cep"`
	UF         *string `json:"uf"`
	Cidade     *string `json:"cidade"`
	Logradouro *string `json:"logradouro"`
	Numero     *string `json:"numero"`
	Bairro     *string `json:"bairro"`
	Observacao *string `json:"observacao"`
	UsuarioID  uint    `json:"usuarioId" validate:"required"`
}

type FornecedorResponse struct {
	ID         uint       `json:"id"`
	Nome       string     `json:"nome"`
	Email      string     `json:"email"`
	Contato    *string    `json:"contato"`
	TipoPessoa string     `json:"tipoPessoa"`
	Documento  string     `json:"documento"`
	Status     string     `json:"status"`
	CEP        *string    `json:"cep"`
	UF         *string    `json:"uf"`
	Cidade     *string    `json:"cidade"`
	Logradouro *string    `json:"logradouro"`
	Numero     *string    `json:"numero"`
	Bairro     *string    `json:"bairro"`
	Observacao *string    `json:"observacao"`
	CreatedAt  time.Time  `json:"createdAt"`
	UpdatedAt  *time.Time `json:"updatedAt"`
}
