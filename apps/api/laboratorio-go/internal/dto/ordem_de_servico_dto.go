package dto

import "time"

type CreateOrdemDeServicoRequest struct {
	CodigoOS         string   `json:"codigoOS" validate:"required"`
	ClienteID        uint     `json:"clienteId" validate:"required"`
	Valor            *float64 `json:"valor"`
	TabelaMontagemID *uint    `json:"tabelaMontagemId"`
	UsuarioID        uint     `json:"usuarioId" validate:"required"`
}

type UpdateOrdemDeServicoRequest struct {
	CodigoOS         string   `json:"codigoOS" validate:"required"`
	ClienteID        uint     `json:"clienteId" validate:"required"`
	Valor            *float64 `json:"valor"`
	TabelaMontagemID *uint    `json:"tabelaMontagemId"`
	UsuarioID        uint     `json:"usuarioId" validate:"required"`
}

type ClienteRefResponse struct {
	ID   uint   `json:"id"`
	Nome string `json:"nome"`
}

type TabelaMontagemRefResponse struct {
	ID      *uint  `json:"id"`
	Servico string `json:"servico"`
}

type OrdemDeServicoResponse struct {
	ID               uint                       `json:"id"`
	CodigoOS         string                     `json:"codigoOS"`
	ClienteID        uint                       `json:"clienteId"`
	Cliente          ClienteRefResponse         `json:"cliente"`
	Valor            *float64                   `json:"valor"`
	TabelaMontagemID *uint                      `json:"tabelaMontagemId"`
	TabelaMontagem   *TabelaMontagemRefResponse `json:"tabelaMontagem"`
	CreatedAt        time.Time                  `json:"createdAt"`
	UpdatedAt        *time.Time                 `json:"updatedAt"`
}
