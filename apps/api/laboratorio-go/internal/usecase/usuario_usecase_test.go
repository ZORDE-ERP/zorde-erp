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

type mockPasswordHasher struct{}

func (m *mockPasswordHasher) Hash(_ string) (string, error)            { return "hashed", nil }
func (m *mockPasswordHasher) Verify(_, _ string) (bool, error)         { return true, nil }

// ── mock ─────────────────────────────────────────────────────────────────────

type mockUsuarioRepo struct {
	createFn             func(u *models.Usuario) error
	findAllFn            func() ([]models.Usuario, error)
	findByIDFn           func(id uint) (*models.Usuario, error)
	findByEmailFn        func(email string) (*models.Usuario, error)
	updateFn             func(u *models.Usuario) error
	updateUltimoAcessoFn func(id uint, data *time.Time) error
	deleteFn             func(id uint) error
}

func (m *mockUsuarioRepo) Create(u *models.Usuario) error            { return m.createFn(u) }
func (m *mockUsuarioRepo) FindAll() ([]models.Usuario, error)        { return m.findAllFn() }
func (m *mockUsuarioRepo) FindByID(id uint) (*models.Usuario, error) { return m.findByIDFn(id) }
func (m *mockUsuarioRepo) FindByEmail(email string) (*models.Usuario, error) {
	if m.findByEmailFn != nil {
		return m.findByEmailFn(email)
	}
	return nil, nil
}
func (m *mockUsuarioRepo) Update(u *models.Usuario) error            { return m.updateFn(u) }
func (m *mockUsuarioRepo) UpdateUltimoAcesso(id uint, data *time.Time) error {
	if m.updateUltimoAcessoFn != nil {
		return m.updateUltimoAcessoFn(id, data)
	}
	return nil
}
func (m *mockUsuarioRepo) Delete(id uint) error                      { return m.deleteFn(id) }

func sampleUsuario() models.Usuario {
	now := time.Now()
	return models.Usuario{
		ID:        1,
		Email:     "joao@example.com",
		Senha:     "$2a$10$hash",
		Nome:      "João Silva",
		Documento: "12345678901",
		Contato:   "11999999999",
		CreatedAt: now,
	}
}

// ── CreateUsuario ─────────────────────────────────────────────────────────────

func TestCreateUsuario_Success(t *testing.T) {
	repo := &mockUsuarioRepo{
		createFn: func(u *models.Usuario) error {
			u.ID = 1
			return nil
		},
	}
	uc := NewUsuarioUseCase(repo, &mockPasswordHasher{})

	resp, err := uc.CreateUsuario(&dto.CreateUsuarioInput{
		Email:     "joao@example.com",
		Senha:     "senha123",
		Nome:      "João Silva",
		Documento: "12345678901",
		Contato:   "11999999999",
	})
	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if resp.Email != "joao@example.com" {
		t.Errorf("email esperado 'joao@example.com', obteve '%s'", resp.Email)
	}
}

func TestCreateUsuario_Conflito(t *testing.T) {
	repo := &mockUsuarioRepo{
		createFn: func(_ *models.Usuario) error {
			return errors.New("duplicate key value violates unique constraint")
		},
	}
	uc := NewUsuarioUseCase(repo, &mockPasswordHasher{})

	_, err := uc.CreateUsuario(&dto.CreateUsuarioInput{
		Email:     "joao@example.com",
		Senha:     "senha123",
		Nome:      "João Silva",
		Documento: "12345678901",
		Contato:   "11999999999",
	})
	if err == nil {
		t.Fatal("esperado erro de conflito")
	}
	var ucErr *UseCaseError
	if !errors.As(err, &ucErr) || ucErr.Code != http.StatusConflict {
		t.Fatalf("esperado UseCaseError 409, obteve: %v", err)
	}
}

// ── ListUsuarios ──────────────────────────────────────────────────────────────

func TestListUsuarios_Success(t *testing.T) {
	repo := &mockUsuarioRepo{
		findAllFn: func() ([]models.Usuario, error) { return []models.Usuario{sampleUsuario()}, nil },
	}
	uc := NewUsuarioUseCase(repo, &mockPasswordHasher{})

	list, err := uc.ListUsuarios()
	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if len(list) != 1 {
		t.Errorf("esperado 1 usuário, obteve %d", len(list))
	}
}

func TestListUsuarios_Vazio(t *testing.T) {
	repo := &mockUsuarioRepo{
		findAllFn: func() ([]models.Usuario, error) { return []models.Usuario{}, nil },
	}
	uc := NewUsuarioUseCase(repo, &mockPasswordHasher{})

	list, err := uc.ListUsuarios()
	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if len(list) != 0 {
		t.Errorf("esperado lista vazia, obteve %d itens", len(list))
	}
}

// ── UpdateUsuario ─────────────────────────────────────────────────────────────

func TestUpdateUsuario_Success(t *testing.T) {
	u := sampleUsuario()
	repo := &mockUsuarioRepo{
		findByIDFn: func(_ uint) (*models.Usuario, error) { return &u, nil },
		updateFn:   func(_ *models.Usuario) error { return nil },
	}
	uc := NewUsuarioUseCase(repo, &mockPasswordHasher{})

	resp, err := uc.UpdateUsuario(1, &dto.UpdateUsuarioInput{Nome: "João Atualizado"})
	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if resp.Nome != "João Atualizado" {
		t.Errorf("nome esperado 'João Atualizado', obteve '%s'", resp.Nome)
	}
}

func TestUpdateUsuario_NaoEncontrado(t *testing.T) {
	repo := &mockUsuarioRepo{
		findByIDFn: func(_ uint) (*models.Usuario, error) { return nil, gorm.ErrRecordNotFound },
	}
	uc := NewUsuarioUseCase(repo, &mockPasswordHasher{})

	_, err := uc.UpdateUsuario(999, &dto.UpdateUsuarioInput{Nome: "X"})
	if err == nil {
		t.Fatal("esperado erro 404")
	}
	var ucErr *UseCaseError
	if !errors.As(err, &ucErr) || ucErr.Code != http.StatusNotFound {
		t.Fatalf("esperado UseCaseError 404, obteve: %v", err)
	}
}

// ── DeleteUsuario ─────────────────────────────────────────────────────────────

func TestDeleteUsuario_Success(t *testing.T) {
	u := sampleUsuario()
	repo := &mockUsuarioRepo{
		findByIDFn: func(_ uint) (*models.Usuario, error) { return &u, nil },
		deleteFn:   func(_ uint) error { return nil },
	}
	uc := NewUsuarioUseCase(repo, &mockPasswordHasher{})

	if err := uc.DeleteUsuario(1); err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
}

func TestDeleteUsuario_NaoEncontrado(t *testing.T) {
	repo := &mockUsuarioRepo{
		findByIDFn: func(_ uint) (*models.Usuario, error) { return nil, gorm.ErrRecordNotFound },
	}
	uc := NewUsuarioUseCase(repo, &mockPasswordHasher{})

	err := uc.DeleteUsuario(999)
	if err == nil {
		t.Fatal("esperado erro 404")
	}
	var ucErr *UseCaseError
	if !errors.As(err, &ucErr) || ucErr.Code != http.StatusNotFound {
		t.Fatalf("esperado UseCaseError 404, obteve: %v", err)
	}
}
