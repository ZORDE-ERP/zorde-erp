package usecase

import (
	"errors"
	"net/http"
	"strings"

	"github.com/zorde/api/internal/dto"
	"github.com/zorde/api/internal/models"
	"github.com/zorde/api/internal/repository"
	"github.com/zorde/api/internal/security"
	"gorm.io/gorm"
)

type UsuarioUseCase interface {
	CreateUsuario(input *dto.CreateUsuarioInput) (*dto.UsuarioResponse, error)
	ListUsuarios() ([]dto.UsuarioResponse, error)
	UpdateUsuario(id uint, input *dto.UpdateUsuarioInput) (*dto.UsuarioResponse, error)
	DeleteUsuario(id uint) error
}

type usuarioUseCase struct {
	repo   repository.UsuarioRepository
	hasher security.PasswordHasher
}

func NewUsuarioUseCase(repo repository.UsuarioRepository, hasher security.PasswordHasher) UsuarioUseCase {
	return &usuarioUseCase{repo: repo, hasher: hasher}
}

func toUsuarioResponse(u *models.Usuario) *dto.UsuarioResponse {
	return &dto.UsuarioResponse{
		ID:           u.ID,
		Email:        u.Email,
		Nome:         u.Nome,
		Documento:    u.Documento,
		Contato:      u.Contato,
		UltimoAcesso: u.UltimoAcesso,
		CreatedAt:    u.CreatedAt,
		UpdatedAt:    u.UpdatedAt,
	}
}

func (uc *usuarioUseCase) CreateUsuario(input *dto.CreateUsuarioInput) (*dto.UsuarioResponse, error) {
	hash, err := uc.hasher.Hash(input.Senha)
	if err != nil {
		return nil, &UseCaseError{Code: http.StatusInternalServerError, Message: "erro ao processar senha"}
	}

	u := &models.Usuario{
		Email:     input.Email,
		Senha:     hash,
		Nome:      input.Nome,
		Documento: input.Documento,
		Contato:   input.Contato,
	}

	if err := uc.repo.Create(u); err != nil {
		// Check for unique constraint violation
		if isUniqueConstraintError(err) {
			return nil, &UseCaseError{Code: http.StatusConflict, Message: "email ou documento já cadastrado"}
		}
		return nil, &UseCaseError{Code: http.StatusInternalServerError, Message: "erro ao criar usuário"}
	}

	return toUsuarioResponse(u), nil
}

func (uc *usuarioUseCase) ListUsuarios() ([]dto.UsuarioResponse, error) {
	usuarios, err := uc.repo.FindAll()
	if err != nil {
		return nil, err
	}
	responses := make([]dto.UsuarioResponse, len(usuarios))
	for i := range usuarios {
		responses[i] = *toUsuarioResponse(&usuarios[i])
	}
	return responses, nil
}

func (uc *usuarioUseCase) UpdateUsuario(id uint, input *dto.UpdateUsuarioInput) (*dto.UsuarioResponse, error) {
	u, err := uc.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, &UseCaseError{Code: http.StatusNotFound, Message: "usuário não encontrado"}
		}
		return nil, &UseCaseError{Code: http.StatusInternalServerError, Message: "erro interno"}
	}

	if input.Nome != "" {
		u.Nome = input.Nome
	}
	if input.Contato != "" {
		u.Contato = input.Contato
	}
	if input.Senha != nil {
		hash, err := uc.hasher.Hash(*input.Senha)
		if err != nil {
			return nil, &UseCaseError{Code: http.StatusInternalServerError, Message: "erro ao processar senha"}
		}
		u.Senha = hash
	}

	if err := uc.repo.Update(u); err != nil {
		return nil, &UseCaseError{Code: http.StatusInternalServerError, Message: "erro ao atualizar usuário"}
	}

	return toUsuarioResponse(u), nil
}

func (uc *usuarioUseCase) DeleteUsuario(id uint) error {
	_, err := uc.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &UseCaseError{Code: http.StatusNotFound, Message: "usuário não encontrado"}
		}
		return &UseCaseError{Code: http.StatusInternalServerError, Message: "erro interno"}
	}
	if err := uc.repo.Delete(id); err != nil {
		return &UseCaseError{Code: http.StatusInternalServerError, Message: "erro ao deletar usuário"}
	}
	return nil
}

// isUniqueConstraintError checks if an error is a PostgreSQL unique violation (code 23505).
func isUniqueConstraintError(err error) bool {
	if err == nil {
		return false
	}
	msg := err.Error()
	return strings.Contains(msg, "23505") || strings.Contains(msg, "unique constraint") || strings.Contains(msg, "duplicate key")
}
