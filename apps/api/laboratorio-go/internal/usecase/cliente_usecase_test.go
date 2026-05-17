package usecase

import (
	"errors"
	"testing"
	"time"

	"github.com/zorde/api/internal/dto"
	"github.com/zorde/api/internal/models"
	"gorm.io/gorm"
)

// ── mock ─────────────────────────────────────────────────────────────────────

type mockClienteRepo struct {
	findAllFn  func() ([]models.Cliente, error)
	findByIDFn func(id uint) (*models.Cliente, error)
	createFn   func(c *models.Cliente) error
	updateFn   func(c *models.Cliente) error
	deleteFn   func(id uint) error
}

func (m *mockClienteRepo) FindAll() ([]models.Cliente, error)        { return m.findAllFn() }
func (m *mockClienteRepo) FindByID(id uint) (*models.Cliente, error) { return m.findByIDFn(id) }
func (m *mockClienteRepo) Create(c *models.Cliente) error            { return m.createFn(c) }
func (m *mockClienteRepo) Update(c *models.Cliente) error            { return m.updateFn(c) }
func (m *mockClienteRepo) Delete(id uint) error                      { return m.deleteFn(id) }

// ── helpers ───────────────────────────────────────────────────────────────────

func strPtr(s string) *string { return &s }

func sampleCliente() models.Cliente {
	now := time.Now()
	return models.Cliente{
		ID:         1,
		Nome:       "João Silva",
		Email:      "joao@example.com",
		TipoPessoa: models.TipoPessoaFisica,
		Documento:  "12345678901",
		Status:     models.StatusPessoaAtivo,
		UsuarioID:  1,
		CreatedAt:  now,
	}
}

// ── GetAll ────────────────────────────────────────────────────────────────────

func TestGetAll_Success(t *testing.T) {
	clientes := []models.Cliente{sampleCliente()}
	repo := &mockClienteRepo{
		findAllFn: func() ([]models.Cliente, error) { return clientes, nil },
	}
	uc := NewClienteUseCase(repo)

	result, err := uc.GetAll()

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if len(result) != 1 {
		t.Fatalf("esperado 1 cliente, obteve %d", len(result))
	}
	if result[0].Nome != clientes[0].Nome {
		t.Errorf("nome esperado %q, obteve %q", clientes[0].Nome, result[0].Nome)
	}
}

func TestGetAll_Empty(t *testing.T) {
	repo := &mockClienteRepo{
		findAllFn: func() ([]models.Cliente, error) { return []models.Cliente{}, nil },
	}
	uc := NewClienteUseCase(repo)

	result, err := uc.GetAll()

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if len(result) != 0 {
		t.Errorf("esperado slice vazio, obteve %d itens", len(result))
	}
}

func TestGetAll_Error(t *testing.T) {
	repoErr := errors.New("db error")
	repo := &mockClienteRepo{
		findAllFn: func() ([]models.Cliente, error) { return nil, repoErr },
	}
	uc := NewClienteUseCase(repo)

	_, err := uc.GetAll()

	if !errors.Is(err, repoErr) {
		t.Errorf("erro esperado %v, obteve %v", repoErr, err)
	}
}

// ── GetByID ───────────────────────────────────────────────────────────────────

func TestGetByID_Success(t *testing.T) {
	c := sampleCliente()
	repo := &mockClienteRepo{
		findByIDFn: func(id uint) (*models.Cliente, error) { return &c, nil },
	}
	uc := NewClienteUseCase(repo)

	result, err := uc.GetByID(1)

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if result.ID != c.ID {
		t.Errorf("ID esperado %d, obteve %d", c.ID, result.ID)
	}
}

func TestGetByID_NotFound(t *testing.T) {
	repo := &mockClienteRepo{
		findByIDFn: func(id uint) (*models.Cliente, error) { return nil, gorm.ErrRecordNotFound },
	}
	uc := NewClienteUseCase(repo)

	_, err := uc.GetByID(99)

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		t.Errorf("esperado gorm.ErrRecordNotFound, obteve %v", err)
	}
}

func TestGetByID_Error(t *testing.T) {
	repoErr := errors.New("connection lost")
	repo := &mockClienteRepo{
		findByIDFn: func(id uint) (*models.Cliente, error) { return nil, repoErr },
	}
	uc := NewClienteUseCase(repo)

	_, err := uc.GetByID(1)

	if !errors.Is(err, repoErr) {
		t.Errorf("erro esperado %v, obteve %v", repoErr, err)
	}
}

// ── Create ────────────────────────────────────────────────────────────────────

func TestCreate_Success(t *testing.T) {
	req := &dto.CreateClienteRequest{
		Nome:       "Maria Souza",
		Email:      "maria@example.com",
		TipoPessoa: "FISICA",
		Documento:  "98765432100",
		Status:     "ATIVO",
		UsuarioID:  2,
	}
	repo := &mockClienteRepo{
		createFn: func(c *models.Cliente) error { return nil },
	}
	uc := NewClienteUseCase(repo)

	result, err := uc.Create(req)

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if result.Nome != req.Nome {
		t.Errorf("nome esperado %q, obteve %q", req.Nome, result.Nome)
	}
	if result.Status != "ATIVO" {
		t.Errorf("status esperado ATIVO, obteve %q", result.Status)
	}
}

func TestCreate_DefaultStatus(t *testing.T) {
	req := &dto.CreateClienteRequest{
		Nome:       "Carlos Lima",
		Email:      "carlos@example.com",
		TipoPessoa: "JURIDICA",
		Documento:  "12345678000195",
		UsuarioID:  1,
		// Status omitido — deve usar ATIVO
	}
	var capturedCliente *models.Cliente
	repo := &mockClienteRepo{
		createFn: func(c *models.Cliente) error {
			capturedCliente = c
			return nil
		},
	}
	uc := NewClienteUseCase(repo)

	_, err := uc.Create(req)

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if capturedCliente.Status != models.StatusPessoaAtivo {
		t.Errorf("status padrão esperado ATIVO, obteve %q", capturedCliente.Status)
	}
}

func TestCreate_Error(t *testing.T) {
	repoErr := errors.New("insert failed")
	req := &dto.CreateClienteRequest{
		Nome:       "Erro",
		Email:      "erro@example.com",
		TipoPessoa: "FISICA",
		Documento:  "00000000000",
		UsuarioID:  1,
	}
	repo := &mockClienteRepo{
		createFn: func(c *models.Cliente) error { return repoErr },
	}
	uc := NewClienteUseCase(repo)

	_, err := uc.Create(req)

	if !errors.Is(err, repoErr) {
		t.Errorf("erro esperado %v, obteve %v", repoErr, err)
	}
}

// ── Update ────────────────────────────────────────────────────────────────────

func TestUpdate_Success(t *testing.T) {
	existing := sampleCliente()
	req := &dto.UpdateClienteRequest{
		Nome:       "João Atualizado",
		Email:      "joao_novo@example.com",
		TipoPessoa: "FISICA",
		Documento:  "12345678901",
		Status:     "INATIVO",
		UsuarioID:  1,
	}
	repo := &mockClienteRepo{
		findByIDFn: func(id uint) (*models.Cliente, error) { return &existing, nil },
		updateFn:   func(c *models.Cliente) error { return nil },
	}
	uc := NewClienteUseCase(repo)

	result, err := uc.Update(1, req)

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if result.Nome != req.Nome {
		t.Errorf("nome esperado %q, obteve %q", req.Nome, result.Nome)
	}
	if result.Status != "INATIVO" {
		t.Errorf("status esperado INATIVO, obteve %q", result.Status)
	}
}

func TestUpdate_NotFound(t *testing.T) {
	req := &dto.UpdateClienteRequest{
		Nome:       "X",
		Email:      "x@x.com",
		TipoPessoa: "FISICA",
		Documento:  "00000000000",
		UsuarioID:  1,
	}
	repo := &mockClienteRepo{
		findByIDFn: func(id uint) (*models.Cliente, error) { return nil, gorm.ErrRecordNotFound },
	}
	uc := NewClienteUseCase(repo)

	_, err := uc.Update(99, req)

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		t.Errorf("esperado gorm.ErrRecordNotFound, obteve %v", err)
	}
}

func TestUpdate_RepoError(t *testing.T) {
	existing := sampleCliente()
	repoErr := errors.New("update failed")
	req := &dto.UpdateClienteRequest{
		Nome:       "João Silva",
		Email:      "joao@example.com",
		TipoPessoa: "FISICA",
		Documento:  "12345678901",
		UsuarioID:  1,
	}
	repo := &mockClienteRepo{
		findByIDFn: func(id uint) (*models.Cliente, error) { return &existing, nil },
		updateFn:   func(c *models.Cliente) error { return repoErr },
	}
	uc := NewClienteUseCase(repo)

	_, err := uc.Update(1, req)

	if !errors.Is(err, repoErr) {
		t.Errorf("erro esperado %v, obteve %v", repoErr, err)
	}
}

// ── Delete ────────────────────────────────────────────────────────────────────

func TestDelete_Success(t *testing.T) {
	existing := sampleCliente()
	repo := &mockClienteRepo{
		findByIDFn: func(id uint) (*models.Cliente, error) { return &existing, nil },
		deleteFn:   func(id uint) error { return nil },
	}
	uc := NewClienteUseCase(repo)

	err := uc.Delete(1)

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
}

func TestDelete_NotFound(t *testing.T) {
	repo := &mockClienteRepo{
		findByIDFn: func(id uint) (*models.Cliente, error) { return nil, gorm.ErrRecordNotFound },
	}
	uc := NewClienteUseCase(repo)

	err := uc.Delete(99)

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		t.Errorf("esperado gorm.ErrRecordNotFound, obteve %v", err)
	}
}

func TestDelete_RepoError(t *testing.T) {
	existing := sampleCliente()
	repoErr := errors.New("delete failed")
	repo := &mockClienteRepo{
		findByIDFn: func(id uint) (*models.Cliente, error) { return &existing, nil },
		deleteFn:   func(id uint) error { return repoErr },
	}
	uc := NewClienteUseCase(repo)

	err := uc.Delete(1)

	if !errors.Is(err, repoErr) {
		t.Errorf("erro esperado %v, obteve %v", repoErr, err)
	}
}

// ── toClienteResponse ─────────────────────────────────────────────────────────

func TestToClienteResponse_MapsAllFields(t *testing.T) {
	now := time.Now()
	updated := now.Add(time.Hour)
	contato := "11999990000"
	c := &models.Cliente{
		ID:         42,
		Nome:       "Ana Costa",
		Email:      "ana@example.com",
		Contato:    &contato,
		TipoPessoa: models.TipoPessoaJuridica,
		Documento:  "12345678000195",
		Status:     models.StatusPessoaInativo,
		CEP:        strPtr("01310-100"),
		UF:         strPtr("SP"),
		Cidade:     strPtr("São Paulo"),
		Logradouro: strPtr("Av. Paulista"),
		Numero:     strPtr("1000"),
		Bairro:     strPtr("Bela Vista"),
		Observacao: strPtr("Obs teste"),
		UsuarioID:  3,
		CreatedAt:  now,
		UpdatedAt:  &updated,
	}

	resp := toClienteResponse(c)

	checks := []struct {
		name string
		got  any
		want any
	}{
		{"ID", resp.ID, c.ID},
		{"Nome", resp.Nome, c.Nome},
		{"Email", resp.Email, c.Email},
		{"Contato", resp.Contato, c.Contato},
		{"TipoPessoa", resp.TipoPessoa, string(c.TipoPessoa)},
		{"Documento", resp.Documento, c.Documento},
		{"Status", resp.Status, string(c.Status)},
		{"CEP", resp.CEP, c.CEP},
		{"UF", resp.UF, c.UF},
		{"Cidade", resp.Cidade, c.Cidade},
		{"Logradouro", resp.Logradouro, c.Logradouro},
		{"Numero", resp.Numero, c.Numero},
		{"Bairro", resp.Bairro, c.Bairro},
		{"Observacao", resp.Observacao, c.Observacao},
		{"UpdatedAt", resp.UpdatedAt, c.UpdatedAt},
	}
	for _, tc := range checks {
		if tc.got != tc.want {
			t.Errorf("campo %s: esperado %v, obteve %v", tc.name, tc.want, tc.got)
		}
	}
}
