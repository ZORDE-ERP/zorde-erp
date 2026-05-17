package dto

import "time"

type CreateUsuarioInput struct {
	Email     string `json:"email" validate:"required,email"`
	Senha     string `json:"senha" validate:"required,min=6"`
	Nome      string `json:"nome" validate:"required"`
	Documento string `json:"documento" validate:"required"`
	Contato   string `json:"contato" validate:"required"`
}

type UpdateUsuarioInput struct {
	Nome    string  `json:"nome" validate:"omitempty"`
	Contato string  `json:"contato" validate:"omitempty"`
	Senha   *string `json:"senha" validate:"omitempty,min=6"`
}

type UsuarioResponse struct {
	ID           uint       `json:"id"`
	Email        string     `json:"email"`
	Nome         string     `json:"nome"`
	Documento    string     `json:"documento"`
	Contato      string     `json:"contato"`
	UltimoAcesso *time.Time `json:"ultimoAcesso"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    *time.Time `json:"updatedAt"`
}
