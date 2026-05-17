package dto

import "time"

type CreateTabelaMontagemRequest struct {
	ClienteID uint    `json:"clienteId" validate:"required"`
	Servico   string  `json:"servico" validate:"required"`
	Valor     float64 `json:"valor" validate:"required,gt=0"`
}

type UpdateTabelaMontagemRequest struct {
	ClienteID uint    `json:"clienteId" validate:"required"`
	Servico   string  `json:"servico" validate:"required"`
	Valor     float64 `json:"valor" validate:"required,gt=0"`
}

type TabelaMontagemResponse struct {
	ID          uint       `json:"id"`
	ClienteID   uint       `json:"clienteId"`
	NomeCliente string     `json:"nomeCliente"`
	Servico     string     `json:"servico"`
	Valor       float64    `json:"valor"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   *time.Time `json:"updatedAt"`
}

type TabelaMontagemListResponse struct {
	Items []TabelaMontagemResponse `json:"items"`
	Total int64                    `json:"total"`
}
