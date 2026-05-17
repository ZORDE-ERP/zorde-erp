package usecase

import (
	"errors"
	"testing"
	"time"

	"github.com/zorde/api/internal/dto"
	"github.com/zorde/api/internal/models"
	"gorm.io/gorm"
)

// ── mock ──────────────────────────────────────────────────────────────────────

type mockFornecedorRepo struct {
	findAllFn  func() ([]models.Fornecedor, error)
	findByIDFn func(id uint) (*models.Fornecedor, error)
	createFn   func(f *models.Fornecedor) error
	updateFn   func(f *models.Fornecedor) error
	deleteFn   func(id uint) error
}

func (m *mockFornecedorRepo) FindAll() ([]models.Fornecedor, error) {
	return m.findAllFn()
}
func (m *mockFornecedorRepo) FindByID(id uint) (*models.Fornecedor, error) {
	return m.findByIDFn(id)
}
func (m *mockFornecedorRepo) Create(f *models.Fornecedor) error { return m.createFn(f) }
func (m *mockFornecedorRepo) Update(f *models.Fornecedor) error { return m.updateFn(f) }
func (m *mockFornecedorRepo) Delete(id uint) error              { return m.deleteFn(id) }

// ── helpers ───────────────────────────────────────────────────────────────────

func sampleFornecedor() models.Fornecedor {
	now := time.Now()
	return models.Fornecedor{
		ID:         1,
		Nome:       "Fornecedor Ltda",
		Email:      "fornecedor@example.com",
		TipoPessoa: models.TipoPessoaJuridica,
		Documento:  "12345678000195",
		Status:     models.StatusPessoaAtivo,
		UsuarioID:  1,
		CreatedAt:  now,
	}
}

// ── GetAll ────────────────────────────────────────────────────────────────────

func TestFornecedorGetAll_Success(t *testing.T) {
	fornecedores := []models.Fornecedor{sampleFornecedor()}
	repo := &mockFornecedorRepo{
		findAllFn: func() ([]models.Fornecedor, error) { return fornecedores, nil },
	}
	uc := NewFornecedorUseCase(repo)

	result, err := uc.GetAll()

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if len(result) != 1 {
		t.Fatalf("esperado 1 fornecedor, obteve %d", len(result))
	}
	if result[0].Nome != fornecedores[0].Nome {
		t.Errorf("nome esperado %q, obteve %q", fornecedores[0].Nome, result[0].Nome)
	}
}

func TestFornecedorGetAll_Empty(t *testing.T) {
	repo := &mockFornecedorRepo{
		findAllFn: func() ([]models.Fornecedor, error) { return []models.Fornecedor{}, nil },
	}
	uc := NewFornecedorUseCase(repo)

	result, err := uc.GetAll()

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if len(result) != 0 {
		t.Errorf("esperado slice vazio, obteve %d itens", len(result))
	}
}

func TestFornecedorGetAll_Error(t *testing.T) {
	repoErr := errors.New("db error")
	repo := &mockFornecedorRepo{
		findAllFn: func() ([]models.Fornecedor, error) { return nil, repoErr },
	}
	uc := NewFornecedorUseCase(repo)

	_, err := uc.GetAll()

	if !errors.Is(err, repoErr) {
		t.Errorf("erro esperado %v, obteve %v", repoErr, err)
	}
}

// ── GetByID ───────────────────────────────────────────────────────────────────

func TestFornecedorGetByID_Success(t *testing.T) {
	f := sampleFornecedor()
	repo := &mockFornecedorRepo{
		findByIDFn: func(id uint) (*models.Fornecedor, error) { return &f, nil },
	}
	uc := NewFornecedorUseCase(repo)

	result, err := uc.GetByID(1)

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if result.ID != f.ID {
		t.Errorf("ID esperado %d, obteve %d", f.ID, result.ID)
	}
}

func TestFornecedorGetByID_NotFound(t *testing.T) {
	repo := &mockFornecedorRepo{
		findByIDFn: func(id uint) (*models.Fornecedor, error) { return nil, gorm.ErrRecordNotFound },
	}
	uc := NewFornecedorUseCase(repo)

	_, err := uc.GetByID(99)

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		t.Errorf("esperado gorm.ErrRecordNotFound, obteve %v", err)
	}
}

func TestFornecedorGetByID_Error(t *testing.T) {
	repoErr := errors.New("connection lost")
	repo := &mockFornecedorRepo{
		findByIDFn: func(id uint) (*models.Fornecedor, error) { return nil, repoErr },
	}
	uc := NewFornecedorUseCase(repo)

	_, err := uc.GetByID(1)

	if !errors.Is(err, repoErr) {
		t.Errorf("erro esperado %v, obteve %v", repoErr, err)
	}
}

// ── Create ────────────────────────────────────────────────────────────────────

func TestFornecedorCreate_Success(t *testing.T) {
	req := &dto.CreateFornecedorRequest{
		Nome:       "Novo Fornecedor S.A.",
		Email:      "novo@fornecedor.com",
		TipoPessoa: "JURIDICA",
		Documento:  "98765432000110",
		Status:     "ATIVO",
		UsuarioID:  2,
	}
	repo := &mockFornecedorRepo{
		createFn: func(f *models.Fornecedor) error { return nil },
	}
	uc := NewFornecedorUseCase(repo)

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

func TestFornecedorCreate_DefaultStatus(t *testing.T) {
	req := &dto.CreateFornecedorRequest{
		Nome:       "Fornecedor Sem Status",
		Email:      "semstatus@fornecedor.com",
		TipoPessoa: "FISICA",
		Documento:  "12345678901",
		UsuarioID:  1,
		// Status omitido — deve usar ATIVO
	}
	var capturedFornecedor *models.Fornecedor
	repo := &mockFornecedorRepo{
		createFn: func(f *models.Fornecedor) error {
			capturedFornecedor = f
			return nil
		},
	}
	uc := NewFornecedorUseCase(repo)

	_, err := uc.Create(req)

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if capturedFornecedor.Status != models.StatusPessoaAtivo {
		t.Errorf("status padrão esperado ATIVO, obteve %q", capturedFornecedor.Status)
	}
}

func TestFornecedorCreate_WithOptionalFields(t *testing.T) {
	contato := "11999990000"
	cep := "01310-100"
	uf := "SP"
	cidade := "São Paulo"
	logradouro := "Av. Paulista"
	numero := "1000"
	bairro := "Bela Vista"
	obs := "Observação de teste"

	req := &dto.CreateFornecedorRequest{
		Nome:       "Fornecedor Completo",
		Email:      "completo@fornecedor.com",
		Contato:    &contato,
		TipoPessoa: "JURIDICA",
		Documento:  "11222333000144",
		Status:     "ATIVO",
		CEP:        &cep,
		UF:         &uf,
		Cidade:     &cidade,
		Logradouro: &logradouro,
		Numero:     &numero,
		Bairro:     &bairro,
		Observacao: &obs,
		UsuarioID:  1,
	}
	repo := &mockFornecedorRepo{
		createFn: func(f *models.Fornecedor) error { return nil },
	}
	uc := NewFornecedorUseCase(repo)

	result, err := uc.Create(req)

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if result.Contato == nil || *result.Contato != contato {
		t.Errorf("contato esperado %q, obteve %v", contato, result.Contato)
	}
	if result.CEP == nil || *result.CEP != cep {
		t.Errorf("CEP esperado %q, obteve %v", cep, result.CEP)
	}
	if result.UF == nil || *result.UF != uf {
		t.Errorf("UF esperada %q, obteve %v", uf, result.UF)
	}
}

func TestFornecedorCreate_Error(t *testing.T) {
	repoErr := errors.New("insert failed")
	req := &dto.CreateFornecedorRequest{
		Nome:       "Erro",
		Email:      "erro@fornecedor.com",
		TipoPessoa: "FISICA",
		Documento:  "00000000000",
		UsuarioID:  1,
	}
	repo := &mockFornecedorRepo{
		createFn: func(f *models.Fornecedor) error { return repoErr },
	}
	uc := NewFornecedorUseCase(repo)

	_, err := uc.Create(req)

	if !errors.Is(err, repoErr) {
		t.Errorf("erro esperado %v, obteve %v", repoErr, err)
	}
}

// ── Update ────────────────────────────────────────────────────────────────────

func TestFornecedorUpdate_Success(t *testing.T) {
	existing := sampleFornecedor()
	req := &dto.UpdateFornecedorRequest{
		Nome:       "Fornecedor Atualizado",
		Email:      "atualizado@fornecedor.com",
		TipoPessoa: "JURIDICA",
		Documento:  "12345678000195",
		Status:     "INATIVO",
		UsuarioID:  1,
	}
	repo := &mockFornecedorRepo{
		findByIDFn: func(id uint) (*models.Fornecedor, error) { return &existing, nil },
		updateFn:   func(f *models.Fornecedor) error { return nil },
	}
	uc := NewFornecedorUseCase(repo)

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

func TestFornecedorUpdate_DefaultStatus(t *testing.T) {
	existing := sampleFornecedor()
	req := &dto.UpdateFornecedorRequest{
		Nome:       "Fornecedor Atualizado",
		Email:      "atualizado@fornecedor.com",
		TipoPessoa: "JURIDICA",
		Documento:  "12345678000195",
		// Status omitido — deve usar ATIVO
		UsuarioID: 1,
	}
	var capturedFornecedor *models.Fornecedor
	repo := &mockFornecedorRepo{
		findByIDFn: func(id uint) (*models.Fornecedor, error) { return &existing, nil },
		updateFn: func(f *models.Fornecedor) error {
			capturedFornecedor = f
			return nil
		},
	}
	uc := NewFornecedorUseCase(repo)

	_, err := uc.Update(1, req)

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if capturedFornecedor.Status != models.StatusPessoaAtivo {
		t.Errorf("status padrão esperado ATIVO, obteve %q", capturedFornecedor.Status)
	}
}

func TestFornecedorUpdate_NotFound(t *testing.T) {
	req := &dto.UpdateFornecedorRequest{
		Nome:       "X",
		Email:      "x@x.com",
		TipoPessoa: "FISICA",
		Documento:  "00000000000",
		UsuarioID:  1,
	}
	repo := &mockFornecedorRepo{
		findByIDFn: func(id uint) (*models.Fornecedor, error) { return nil, gorm.ErrRecordNotFound },
	}
	uc := NewFornecedorUseCase(repo)

	_, err := uc.Update(99, req)

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		t.Errorf("esperado gorm.ErrRecordNotFound, obteve %v", err)
	}
}

func TestFornecedorUpdate_FindError(t *testing.T) {
	repoErr := errors.New("connection lost")
	req := &dto.UpdateFornecedorRequest{
		Nome:       "X",
		Email:      "x@x.com",
		TipoPessoa: "FISICA",
		Documento:  "00000000000",
		UsuarioID:  1,
	}
	repo := &mockFornecedorRepo{
		findByIDFn: func(id uint) (*models.Fornecedor, error) { return nil, repoErr },
	}
	uc := NewFornecedorUseCase(repo)

	_, err := uc.Update(1, req)

	if !errors.Is(err, repoErr) {
		t.Errorf("erro esperado %v, obteve %v", repoErr, err)
	}
}

func TestFornecedorUpdate_RepoError(t *testing.T) {
	existing := sampleFornecedor()
	repoErr := errors.New("update failed")
	req := &dto.UpdateFornecedorRequest{
		Nome:       "Fornecedor Ltda",
		Email:      "fornecedor@example.com",
		TipoPessoa: "JURIDICA",
		Documento:  "12345678000195",
		UsuarioID:  1,
	}
	repo := &mockFornecedorRepo{
		findByIDFn: func(id uint) (*models.Fornecedor, error) { return &existing, nil },
		updateFn:   func(f *models.Fornecedor) error { return repoErr },
	}
	uc := NewFornecedorUseCase(repo)

	_, err := uc.Update(1, req)

	if !errors.Is(err, repoErr) {
		t.Errorf("erro esperado %v, obteve %v", repoErr, err)
	}
}

// ── Delete ────────────────────────────────────────────────────────────────────

func TestFornecedorDelete_Success(t *testing.T) {
	existing := sampleFornecedor()
	repo := &mockFornecedorRepo{
		findByIDFn: func(id uint) (*models.Fornecedor, error) { return &existing, nil },
		deleteFn:   func(id uint) error { return nil },
	}
	uc := NewFornecedorUseCase(repo)

	err := uc.Delete(1)

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
}

func TestFornecedorDelete_NotFound(t *testing.T) {
	repo := &mockFornecedorRepo{
		findByIDFn: func(id uint) (*models.Fornecedor, error) { return nil, gorm.ErrRecordNotFound },
	}
	uc := NewFornecedorUseCase(repo)

	err := uc.Delete(99)

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		t.Errorf("esperado gorm.ErrRecordNotFound, obteve %v", err)
	}
}

func TestFornecedorDelete_FindError(t *testing.T) {
	repoErr := errors.New("connection lost")
	repo := &mockFornecedorRepo{
		findByIDFn: func(id uint) (*models.Fornecedor, error) { return nil, repoErr },
	}
	uc := NewFornecedorUseCase(repo)

	err := uc.Delete(1)

	if !errors.Is(err, repoErr) {
		t.Errorf("erro esperado %v, obteve %v", repoErr, err)
	}
}

func TestFornecedorDelete_RepoError(t *testing.T) {
	existing := sampleFornecedor()
	repoErr := errors.New("delete failed")
	repo := &mockFornecedorRepo{
		findByIDFn: func(id uint) (*models.Fornecedor, error) { return &existing, nil },
		deleteFn:   func(id uint) error { return repoErr },
	}
	uc := NewFornecedorUseCase(repo)

	err := uc.Delete(1)

	if !errors.Is(err, repoErr) {
		t.Errorf("erro esperado %v, obteve %v", repoErr, err)
	}
}

// ── toFornecedorResponse ──────────────────────────────────────────────────────

func TestToFornecedorResponse_MapsAllFields(t *testing.T) {
	now := time.Now()
	updated := now.Add(time.Hour)
	contato := "11999990000"
	cep := "01310-100"
	uf := "SP"
	cidade := "São Paulo"
	logradouro := "Av. Paulista"
	numero := "1000"
	bairro := "Bela Vista"
	obs := "Nenhuma"

	f := &models.Fornecedor{
		ID:         42,
		Nome:       "Fornecedor Completo",
		Email:      "completo@fornecedor.com",
		Contato:    &contato,
		TipoPessoa: models.TipoPessoaJuridica,
		Documento:  "11222333000144",
		Status:     models.StatusPessoaInativo,
		CEP:        &cep,
		UF:         &uf,
		Cidade:     &cidade,
		Logradouro: &logradouro,
		Numero:     &numero,
		Bairro:     &bairro,
		Observacao: &obs,
		UsuarioID:  5,
		CreatedAt:  now,
		UpdatedAt:  &updated,
	}

	resp := toFornecedorResponse(f)

	if resp.ID != f.ID {
		t.Errorf("ID esperado %d, obteve %d", f.ID, resp.ID)
	}
	if resp.Nome != f.Nome {
		t.Errorf("Nome esperado %q, obteve %q", f.Nome, resp.Nome)
	}
	if resp.Email != f.Email {
		t.Errorf("Email esperado %q, obteve %q", f.Email, resp.Email)
	}
	if resp.Contato == nil || *resp.Contato != contato {
		t.Errorf("Contato esperado %q, obteve %v", contato, resp.Contato)
	}
	if resp.TipoPessoa != string(f.TipoPessoa) {
		t.Errorf("TipoPessoa esperado %q, obteve %q", f.TipoPessoa, resp.TipoPessoa)
	}
	if resp.Documento != f.Documento {
		t.Errorf("Documento esperado %q, obteve %q", f.Documento, resp.Documento)
	}
	if resp.Status != string(f.Status) {
		t.Errorf("Status esperado %q, obteve %q", f.Status, resp.Status)
	}
	if resp.CEP == nil || *resp.CEP != cep {
		t.Errorf("CEP esperado %q, obteve %v", cep, resp.CEP)
	}
	if resp.UF == nil || *resp.UF != uf {
		t.Errorf("UF esperada %q, obteve %v", uf, resp.UF)
	}
	if resp.Cidade == nil || *resp.Cidade != cidade {
		t.Errorf("Cidade esperada %q, obteve %v", cidade, resp.Cidade)
	}
	if resp.Logradouro == nil || *resp.Logradouro != logradouro {
		t.Errorf("Logradouro esperado %q, obteve %v", logradouro, resp.Logradouro)
	}
	if resp.Numero == nil || *resp.Numero != numero {
		t.Errorf("Numero esperado %q, obteve %v", numero, resp.Numero)
	}
	if resp.Bairro == nil || *resp.Bairro != bairro {
		t.Errorf("Bairro esperado %q, obteve %v", bairro, resp.Bairro)
	}
	if resp.Observacao == nil || *resp.Observacao != obs {
		t.Errorf("Observacao esperada %q, obteve %v", obs, resp.Observacao)
	}
	if !resp.CreatedAt.Equal(now) {
		t.Errorf("CreatedAt esperado %v, obteve %v", now, resp.CreatedAt)
	}
	if resp.UpdatedAt == nil || !resp.UpdatedAt.Equal(updated) {
		t.Errorf("UpdatedAt esperado %v, obteve %v", updated, resp.UpdatedAt)
	}
}

func TestToFornecedorResponse_NilOptionalFields(t *testing.T) {
	now := time.Now()
	f := &models.Fornecedor{
		ID:         1,
		Nome:       "Fornecedor Simples",
		Email:      "simples@fornecedor.com",
		TipoPessoa: models.TipoPessoaFisica,
		Documento:  "12345678901",
		Status:     models.StatusPessoaAtivo,
		UsuarioID:  1,
		CreatedAt:  now,
	}

	resp := toFornecedorResponse(f)

	if resp.Contato != nil {
		t.Errorf("Contato esperado nil, obteve %v", resp.Contato)
	}
	if resp.CEP != nil {
		t.Errorf("CEP esperado nil, obteve %v", resp.CEP)
	}
	if resp.UF != nil {
		t.Errorf("UF esperada nil, obteve %v", resp.UF)
	}
	if resp.Cidade != nil {
		t.Errorf("Cidade esperada nil, obteve %v", resp.Cidade)
	}
	if resp.UpdatedAt != nil {
		t.Errorf("UpdatedAt esperado nil, obteve %v", resp.UpdatedAt)
	}
}
