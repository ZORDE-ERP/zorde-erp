package dto

type SolicitarCadastroInput struct {
	Email string `json:"email" validate:"required,email"`
}

type VerificarEmailInput struct {
	Email  string `json:"email" validate:"required,email"`
	Codigo string `json:"codigo" validate:"required,len=6"`
}

type ReenviarCodigoInput struct {
	Email string `json:"email" validate:"required,email"`
}
