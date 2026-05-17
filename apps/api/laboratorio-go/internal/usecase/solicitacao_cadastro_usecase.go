package usecase

import (
	"crypto/rand"
	"fmt"
	"net/http"
	"time"

	"github.com/zorde/api/internal/dto"
	"github.com/zorde/api/internal/models"
	"github.com/zorde/api/internal/repository"
	"github.com/zorde/api/internal/service"
	"gorm.io/gorm"
)

// UseCaseError carries an HTTP status code alongside the message.
type UseCaseError struct {
	Code    int
	Message string
}

func (e *UseCaseError) Error() string { return e.Message }

type SolicitacaoCadastroUseCase interface {
	SolicitarCadastro(input *dto.SolicitarCadastroInput) error
	VerificarEmail(input *dto.VerificarEmailInput) error
	ReenviarCodigo(input *dto.ReenviarCodigoInput) error
}

type solicitacaoCadastroUseCase struct {
	repo         repository.SolicitacaoCadastroRepository
	emailService service.EmailService
}

func NewSolicitacaoCadastroUseCase(
	repo repository.SolicitacaoCadastroRepository,
	emailService service.EmailService,
) SolicitacaoCadastroUseCase {
	return &solicitacaoCadastroUseCase{repo: repo, emailService: emailService}
}

func generateOTP() (string, error) {
	b := make([]byte, 3)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	n := (int(b[0])<<16 | int(b[1])<<8 | int(b[2])) % 1_000_000
	return fmt.Sprintf("%06d", n), nil
}

func (uc *solicitacaoCadastroUseCase) SolicitarCadastro(input *dto.SolicitarCadastroInput) error {
	codigo, err := generateOTP()
	if err != nil {
		return &UseCaseError{Code: http.StatusInternalServerError, Message: "erro ao gerar código"}
	}

	// Delete existing record (if any) before inserting new one
	_ = uc.repo.DeleteByEmail(input.Email)

	s := &models.SolicitacaoCadastro{
		Email:     input.Email,
		Codigo:    codigo,
		Expiracao: time.Now().Add(5 * time.Minute),
	}
	if err := uc.repo.Create(s); err != nil {
		return &UseCaseError{Code: http.StatusInternalServerError, Message: "erro ao salvar solicitação"}
	}

	if err := uc.emailService.SendVerificationCode(input.Email, codigo); err != nil {
		return &UseCaseError{Code: http.StatusInternalServerError, Message: "erro ao enviar email"}
	}

	return nil
}

func (uc *solicitacaoCadastroUseCase) VerificarEmail(input *dto.VerificarEmailInput) error {
	s, err := uc.repo.FindByEmail(input.Email)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return &UseCaseError{Code: http.StatusBadRequest, Message: "Código inválido"}
		}
		return &UseCaseError{Code: http.StatusInternalServerError, Message: "erro interno"}
	}

	if time.Now().After(s.Expiracao) {
		_ = uc.repo.DeleteByEmail(input.Email)
		return &UseCaseError{Code: http.StatusBadRequest, Message: "Código expirado"}
	}

	if s.Codigo != input.Codigo {
		return &UseCaseError{Code: http.StatusBadRequest, Message: "Código inválido"}
	}

	_ = uc.repo.DeleteByEmail(input.Email)
	return nil
}

func (uc *solicitacaoCadastroUseCase) ReenviarCodigo(input *dto.ReenviarCodigoInput) error {
	existing, err := uc.repo.FindByEmail(input.Email)
	if err == nil {
		// Record exists — check cooldown
		if time.Since(existing.CriadoEm) < 30*time.Second {
			return &UseCaseError{Code: http.StatusTooManyRequests, Message: "Aguarde 30 segundos antes de reenviar"}
		}
		_ = uc.repo.DeleteByEmail(input.Email)
	}

	codigo, err := generateOTP()
	if err != nil {
		return &UseCaseError{Code: http.StatusInternalServerError, Message: "erro ao gerar código"}
	}

	s := &models.SolicitacaoCadastro{
		Email:     input.Email,
		Codigo:    codigo,
		Expiracao: time.Now().Add(5 * time.Minute),
	}
	if err := uc.repo.Create(s); err != nil {
		return &UseCaseError{Code: http.StatusInternalServerError, Message: "erro ao salvar solicitação"}
	}

	if err := uc.emailService.SendVerificationCode(input.Email, codigo); err != nil {
		return &UseCaseError{Code: http.StatusInternalServerError, Message: "erro ao enviar email"}
	}

	return nil
}
