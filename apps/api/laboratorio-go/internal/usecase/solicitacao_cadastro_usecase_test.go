package usecase

import (
	"errors"
	"net/http"
	"testing"
	"time"

	"github.com/zorde/api/internal/dto"
	"github.com/zorde/api/internal/models"
	"gorm.io/gorm"
)

// ── mocks ────────────────────────────────────────────────────────────────────

type mockSolicitacaoRepo struct {
	createFn        func(s *models.SolicitacaoCadastro) error
	findByEmailFn   func(email string) (*models.SolicitacaoCadastro, error)
	deleteByEmailFn func(email string) error
}

func (m *mockSolicitacaoRepo) Create(s *models.SolicitacaoCadastro) error {
	return m.createFn(s)
}
func (m *mockSolicitacaoRepo) FindByEmail(email string) (*models.SolicitacaoCadastro, error) {
	return m.findByEmailFn(email)
}
func (m *mockSolicitacaoRepo) DeleteByEmail(email string) error {
	return m.deleteByEmailFn(email)
}

type mockEmailService struct {
	sendFn func(to, code string) error
}

func (m *mockEmailService) SendVerificationCode(to, code string) error {
	return m.sendFn(to, code)
}

// ── SolicitarCadastro ─────────────────────────────────────────────────────────

func TestSolicitarCadastro_Success(t *testing.T) {
	repo := &mockSolicitacaoRepo{
		deleteByEmailFn: func(_ string) error { return nil },
		createFn:        func(_ *models.SolicitacaoCadastro) error { return nil },
	}
	emailSvc := &mockEmailService{
		sendFn: func(_, _ string) error { return nil },
	}
	uc := NewSolicitacaoCadastroUseCase(repo, emailSvc)

	err := uc.SolicitarCadastro(&dto.SolicitarCadastroInput{Email: "test@example.com"})
	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
}

func TestSolicitarCadastro_EmailSendFailure(t *testing.T) {
	repo := &mockSolicitacaoRepo{
		deleteByEmailFn: func(_ string) error { return nil },
		createFn:        func(_ *models.SolicitacaoCadastro) error { return nil },
	}
	emailSvc := &mockEmailService{
		sendFn: func(_, _ string) error { return errors.New("smtp error") },
	}
	uc := NewSolicitacaoCadastroUseCase(repo, emailSvc)

	err := uc.SolicitarCadastro(&dto.SolicitarCadastroInput{Email: "test@example.com"})
	if err == nil {
		t.Fatal("esperado erro, obteve nil")
	}
	var ucErr *UseCaseError
	if !errors.As(err, &ucErr) || ucErr.Code != http.StatusInternalServerError {
		t.Fatalf("esperado UseCaseError 500, obteve: %v", err)
	}
}

// ── VerificarEmail ────────────────────────────────────────────────────────────

func TestVerificarEmail_CodigoCorretoNaoExpirado(t *testing.T) {
	solicitacao := &models.SolicitacaoCadastro{
		Email:     "test@example.com",
		Codigo:    "123456",
		Expiracao: time.Now().Add(5 * time.Minute),
	}
	repo := &mockSolicitacaoRepo{
		findByEmailFn:   func(_ string) (*models.SolicitacaoCadastro, error) { return solicitacao, nil },
		deleteByEmailFn: func(_ string) error { return nil },
	}
	uc := NewSolicitacaoCadastroUseCase(repo, &mockEmailService{})

	err := uc.VerificarEmail(&dto.VerificarEmailInput{Email: "test@example.com", Codigo: "123456"})
	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
}

func TestVerificarEmail_CodigoExpirado(t *testing.T) {
	solicitacao := &models.SolicitacaoCadastro{
		Email:     "test@example.com",
		Codigo:    "123456",
		Expiracao: time.Now().Add(-1 * time.Minute), // already expired
	}
	repo := &mockSolicitacaoRepo{
		findByEmailFn:   func(_ string) (*models.SolicitacaoCadastro, error) { return solicitacao, nil },
		deleteByEmailFn: func(_ string) error { return nil },
	}
	uc := NewSolicitacaoCadastroUseCase(repo, &mockEmailService{})

	err := uc.VerificarEmail(&dto.VerificarEmailInput{Email: "test@example.com", Codigo: "123456"})
	if err == nil {
		t.Fatal("esperado erro de código inválido")
	}
	var ucErr *UseCaseError
	if !errors.As(err, &ucErr) || ucErr.Code != http.StatusBadRequest {
		t.Fatalf("esperado UseCaseError 400, obteve: %v", err)
	}
}

func TestVerificarEmail_CodigoIncorreto(t *testing.T) {
	solicitacao := &models.SolicitacaoCadastro{
		Email:     "test@example.com",
		Codigo:    "999999",
		Expiracao: time.Now().Add(5 * time.Minute),
	}
	repo := &mockSolicitacaoRepo{
		findByEmailFn:   func(_ string) (*models.SolicitacaoCadastro, error) { return solicitacao, nil },
		deleteByEmailFn: func(_ string) error { return nil },
	}
	uc := NewSolicitacaoCadastroUseCase(repo, &mockEmailService{})

	err := uc.VerificarEmail(&dto.VerificarEmailInput{Email: "test@example.com", Codigo: "123456"})
	if err == nil {
		t.Fatal("esperado erro de código inválido")
	}
	var ucErr *UseCaseError
	if !errors.As(err, &ucErr) || ucErr.Code != http.StatusBadRequest {
		t.Fatalf("esperado UseCaseError 400, obteve: %v", err)
	}
}

func TestVerificarEmail_EmailNaoEncontrado(t *testing.T) {
	repo := &mockSolicitacaoRepo{
		findByEmailFn: func(_ string) (*models.SolicitacaoCadastro, error) {
			return nil, gorm.ErrRecordNotFound
		},
		deleteByEmailFn: func(_ string) error { return nil },
	}
	uc := NewSolicitacaoCadastroUseCase(repo, &mockEmailService{})

	err := uc.VerificarEmail(&dto.VerificarEmailInput{Email: "nope@example.com", Codigo: "000000"})
	if err == nil {
		t.Fatal("esperado erro de código inválido")
	}
	var ucErr *UseCaseError
	if !errors.As(err, &ucErr) || ucErr.Code != http.StatusBadRequest {
		t.Fatalf("esperado UseCaseError 400, obteve: %v", err)
	}
}

// ── ReenviarCodigo ────────────────────────────────────────────────────────────

func TestReenviarCodigo_PermitidoApos30s(t *testing.T) {
	solicitacao := &models.SolicitacaoCadastro{
		Email:    "test@example.com",
		CriadoEm: time.Now().Add(-1 * time.Minute), // 1 min ago, cooldown passed
	}
	repo := &mockSolicitacaoRepo{
		findByEmailFn:   func(_ string) (*models.SolicitacaoCadastro, error) { return solicitacao, nil },
		deleteByEmailFn: func(_ string) error { return nil },
		createFn:        func(_ *models.SolicitacaoCadastro) error { return nil },
	}
	emailSvc := &mockEmailService{sendFn: func(_, _ string) error { return nil }}
	uc := NewSolicitacaoCadastroUseCase(repo, emailSvc)

	err := uc.ReenviarCodigo(&dto.ReenviarCodigoInput{Email: "test@example.com"})
	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
}

func TestReenviarCodigo_BloqueadoPorCooldown(t *testing.T) {
	solicitacao := &models.SolicitacaoCadastro{
		Email:    "test@example.com",
		CriadoEm: time.Now().Add(-10 * time.Second), // only 10s ago
	}
	repo := &mockSolicitacaoRepo{
		findByEmailFn:   func(_ string) (*models.SolicitacaoCadastro, error) { return solicitacao, nil },
		deleteByEmailFn: func(_ string) error { return nil },
	}
	uc := NewSolicitacaoCadastroUseCase(repo, &mockEmailService{})

	err := uc.ReenviarCodigo(&dto.ReenviarCodigoInput{Email: "test@example.com"})
	if err == nil {
		t.Fatal("esperado erro de cooldown")
	}
	var ucErr *UseCaseError
	if !errors.As(err, &ucErr) || ucErr.Code != http.StatusTooManyRequests {
		t.Fatalf("esperado UseCaseError 429, obteve: %v", err)
	}
}

func TestReenviarCodigo_SemSolicitacaoPrevia(t *testing.T) {
	repo := &mockSolicitacaoRepo{
		findByEmailFn: func(_ string) (*models.SolicitacaoCadastro, error) {
			return nil, gorm.ErrRecordNotFound
		},
		deleteByEmailFn: func(_ string) error { return nil },
		createFn:        func(_ *models.SolicitacaoCadastro) error { return nil },
	}
	emailSvc := &mockEmailService{sendFn: func(_, _ string) error { return nil }}
	uc := NewSolicitacaoCadastroUseCase(repo, emailSvc)

	err := uc.ReenviarCodigo(&dto.ReenviarCodigoInput{Email: "new@example.com"})
	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
}
