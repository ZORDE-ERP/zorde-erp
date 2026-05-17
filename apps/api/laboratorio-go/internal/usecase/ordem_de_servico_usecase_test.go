package usecase

import (
	"errors"
	"fmt"
	"testing"
	"time"

	"github.com/zorde/api/internal/dto"
	"github.com/zorde/api/internal/models"
	"gorm.io/gorm"
)

// ── mocks ─────────────────────────────────────────────────────────────────────

type mockOrdemDeServicoRepo struct {
	findAllFn  func() ([]models.OrdemDeServico, error)
	findByIDFn func(id uint) (*models.OrdemDeServico, error)
	createFn   func(o *models.OrdemDeServico) error
	updateFn   func(o *models.OrdemDeServico) error
	deleteFn   func(id uint) error
}

func (m *mockOrdemDeServicoRepo) FindAll() ([]models.OrdemDeServico, error) {
	return m.findAllFn()
}
func (m *mockOrdemDeServicoRepo) FindByID(id uint) (*models.OrdemDeServico, error) {
	return m.findByIDFn(id)
}
func (m *mockOrdemDeServicoRepo) Create(o *models.OrdemDeServico) error { return m.createFn(o) }
func (m *mockOrdemDeServicoRepo) Update(o *models.OrdemDeServico) error { return m.updateFn(o) }
func (m *mockOrdemDeServicoRepo) Delete(id uint) error                  { return m.deleteFn(id) }

type mockTabelaMontagemRepo struct {
	findByIDFn func(id uint) (*models.TabelaMontagem, error)
}

func (m *mockTabelaMontagemRepo) FindAll(page, limit int, search string) ([]models.TabelaMontagem, int64, error) {
	return nil, 0, nil
}
func (m *mockTabelaMontagemRepo) FindByID(id uint) (*models.TabelaMontagem, error) {
	return m.findByIDFn(id)
}
func (m *mockTabelaMontagemRepo) Create(tabela *models.TabelaMontagem) error { return nil }
func (m *mockTabelaMontagemRepo) Update(tabela *models.TabelaMontagem) error { return nil }
func (m *mockTabelaMontagemRepo) Delete(id uint) error                       { return nil }

// ── helpers ───────────────────────────────────────────────────────────────────

func floatPtr(f float64) *float64 { return &f }
func uintPtr(u uint) *uint        { return &u }

func sampleOrdem() models.OrdemDeServico {
	now := time.Now()
	return models.OrdemDeServico{
		ID:        1,
		CodigoOS:  "OS-001",
		ClienteID: 1,
		Cliente: models.Cliente{
			ID:   1,
			Nome: "João Silva",
		},
		Valor:            floatPtr(150.0),
		TabelaMontagemID: uintPtr(1),
		TabelaMontagem: models.TabelaMontagem{
			ID:      1,
			Servico: models.TipoServicoMontagemSimples,
		},
		UsuarioID: 1,
		CreatedAt: now,
	}
}

func sampleCliente2() models.Cliente {
	return models.Cliente{ID: 1, Nome: "João Silva"}
}

func sampleTabela() models.TabelaMontagem {
	return models.TabelaMontagem{ID: 1, Servico: models.TipoServicoMontagemSimples, Valor: 100.0}
}

func newOrdemUseCase(
	repo *mockOrdemDeServicoRepo,
	clienteRepo *mockClienteRepo,
	tabelaRepo *mockTabelaMontagemRepo,
) OrdemDeServicoUseCase {
	return NewOrdemDeServicoUseCase(repo, clienteRepo, tabelaRepo)
}

// ── GetAll ────────────────────────────────────────────────────────────────────

func TestOrdemGetAll_Success(t *testing.T) {
	ordens := []models.OrdemDeServico{sampleOrdem()}
	repo := &mockOrdemDeServicoRepo{
		findAllFn: func() ([]models.OrdemDeServico, error) { return ordens, nil },
	}
	uc := newOrdemUseCase(repo, &mockClienteRepo{}, &mockTabelaMontagemRepo{})

	result, err := uc.GetAll()

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if len(result) != 1 {
		t.Fatalf("esperado 1 ordem, obteve %d", len(result))
	}
	if result[0].CodigoOS != ordens[0].CodigoOS {
		t.Errorf("codigoOS esperado %q, obteve %q", ordens[0].CodigoOS, result[0].CodigoOS)
	}
}

func TestOrdemGetAll_Empty(t *testing.T) {
	repo := &mockOrdemDeServicoRepo{
		findAllFn: func() ([]models.OrdemDeServico, error) { return []models.OrdemDeServico{}, nil },
	}
	uc := newOrdemUseCase(repo, &mockClienteRepo{}, &mockTabelaMontagemRepo{})

	result, err := uc.GetAll()

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if len(result) != 0 {
		t.Errorf("esperado slice vazio, obteve %d itens", len(result))
	}
}

func TestOrdemGetAll_Error(t *testing.T) {
	repoErr := errors.New("db error")
	repo := &mockOrdemDeServicoRepo{
		findAllFn: func() ([]models.OrdemDeServico, error) { return nil, repoErr },
	}
	uc := newOrdemUseCase(repo, &mockClienteRepo{}, &mockTabelaMontagemRepo{})

	_, err := uc.GetAll()

	if !errors.Is(err, repoErr) {
		t.Errorf("erro esperado %v, obteve %v", repoErr, err)
	}
}

// ── GetByID ───────────────────────────────────────────────────────────────────

func TestOrdemGetByID_Success(t *testing.T) {
	o := sampleOrdem()
	repo := &mockOrdemDeServicoRepo{
		findByIDFn: func(id uint) (*models.OrdemDeServico, error) { return &o, nil },
	}
	uc := newOrdemUseCase(repo, &mockClienteRepo{}, &mockTabelaMontagemRepo{})

	result, err := uc.GetByID(1)

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if result.ID != o.ID {
		t.Errorf("ID esperado %d, obteve %d", o.ID, result.ID)
	}
	if result.CodigoOS != o.CodigoOS {
		t.Errorf("codigoOS esperado %q, obteve %q", o.CodigoOS, result.CodigoOS)
	}
}

func TestOrdemGetByID_NotFound(t *testing.T) {
	repo := &mockOrdemDeServicoRepo{
		findByIDFn: func(id uint) (*models.OrdemDeServico, error) { return nil, gorm.ErrRecordNotFound },
	}
	uc := newOrdemUseCase(repo, &mockClienteRepo{}, &mockTabelaMontagemRepo{})

	_, err := uc.GetByID(99)

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		t.Errorf("esperado gorm.ErrRecordNotFound, obteve %v", err)
	}
}

func TestOrdemGetByID_Error(t *testing.T) {
	repoErr := errors.New("connection lost")
	repo := &mockOrdemDeServicoRepo{
		findByIDFn: func(id uint) (*models.OrdemDeServico, error) { return nil, repoErr },
	}
	uc := newOrdemUseCase(repo, &mockClienteRepo{}, &mockTabelaMontagemRepo{})

	_, err := uc.GetByID(1)

	if !errors.Is(err, repoErr) {
		t.Errorf("erro esperado %v, obteve %v", repoErr, err)
	}
}

// ── Create ────────────────────────────────────────────────────────────────────

func TestOrdemCreate_Success(t *testing.T) {
	o := sampleOrdem()
	cliente := sampleCliente2()
	tabela := sampleTabela()

	callCount := 0
	repo := &mockOrdemDeServicoRepo{
		createFn: func(ord *models.OrdemDeServico) error { ord.ID = 1; return nil },
		findByIDFn: func(id uint) (*models.OrdemDeServico, error) {
			callCount++
			return &o, nil
		},
	}
	clienteRepo := &mockClienteRepo{
		findByIDFn: func(id uint) (*models.Cliente, error) { return &cliente, nil },
	}
	tabelaRepo := &mockTabelaMontagemRepo{
		findByIDFn: func(id uint) (*models.TabelaMontagem, error) { return &tabela, nil },
	}
	uc := newOrdemUseCase(repo, clienteRepo, tabelaRepo)

	req := &dto.CreateOrdemDeServicoRequest{
		CodigoOS:         "OS-001",
		ClienteID:        1,
		Valor:            floatPtr(150.0),
		TabelaMontagemID: uintPtr(1),
		UsuarioID:        1,
	}
	result, err := uc.Create(req)

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if result.CodigoOS != req.CodigoOS {
		t.Errorf("codigoOS esperado %q, obteve %q", req.CodigoOS, result.CodigoOS)
	}
}

func TestOrdemCreate_ClienteNotFound(t *testing.T) {
	repo := &mockOrdemDeServicoRepo{}
	clienteRepo := &mockClienteRepo{
		findByIDFn: func(id uint) (*models.Cliente, error) { return nil, gorm.ErrRecordNotFound },
	}
	tabelaRepo := &mockTabelaMontagemRepo{}
	uc := newOrdemUseCase(repo, clienteRepo, tabelaRepo)

	req := &dto.CreateOrdemDeServicoRequest{
		CodigoOS:         "OS-002",
		ClienteID:        99,
		TabelaMontagemID: uintPtr(1),
		UsuarioID:        1,
	}
	_, err := uc.Create(req)

	if err == nil {
		t.Fatal("esperado erro, obteve nil")
	}
	expected := fmt.Sprintf("cliente com id %d não encontrado", req.ClienteID)
	if err.Error() != expected {
		t.Errorf("mensagem esperada %q, obteve %q", expected, err.Error())
	}
}

func TestOrdemCreate_TabelaNotFound(t *testing.T) {
	cliente := sampleCliente2()
	repo := &mockOrdemDeServicoRepo{}
	clienteRepo := &mockClienteRepo{
		findByIDFn: func(id uint) (*models.Cliente, error) { return &cliente, nil },
	}
	tabelaRepo := &mockTabelaMontagemRepo{
		findByIDFn: func(id uint) (*models.TabelaMontagem, error) { return nil, gorm.ErrRecordNotFound },
	}
	uc := newOrdemUseCase(repo, clienteRepo, tabelaRepo)

	req := &dto.CreateOrdemDeServicoRequest{
		CodigoOS:         "OS-003",
		ClienteID:        1,
		TabelaMontagemID: uintPtr(99),
		UsuarioID:        1,
	}
	_, err := uc.Create(req)

	if err == nil {
		t.Fatal("esperado erro, obteve nil")
	}
	expected := fmt.Sprintf("tabela de montagem com id %d não encontrada", *req.TabelaMontagemID)
	if err.Error() != expected {
		t.Errorf("mensagem esperada %q, obteve %q", expected, err.Error())
	}
}

func TestOrdemCreate_RepoError(t *testing.T) {
	repoErr := errors.New("insert failed")
	cliente := sampleCliente2()
	tabela := sampleTabela()

	repo := &mockOrdemDeServicoRepo{
		createFn: func(o *models.OrdemDeServico) error { return repoErr },
	}
	clienteRepo := &mockClienteRepo{
		findByIDFn: func(id uint) (*models.Cliente, error) { return &cliente, nil },
	}
	tabelaRepo := &mockTabelaMontagemRepo{
		findByIDFn: func(id uint) (*models.TabelaMontagem, error) { return &tabela, nil },
	}
	uc := newOrdemUseCase(repo, clienteRepo, tabelaRepo)

	req := &dto.CreateOrdemDeServicoRequest{
		CodigoOS:         "OS-004",
		ClienteID:        1,
		TabelaMontagemID: uintPtr(1),
		UsuarioID:        1,
	}
	_, err := uc.Create(req)

	if !errors.Is(err, repoErr) {
		t.Errorf("erro esperado %v, obteve %v", repoErr, err)
	}
}

// ── Update ────────────────────────────────────────────────────────────────────

func TestOrdemUpdate_Success(t *testing.T) {
	existing := sampleOrdem()
	updated := sampleOrdem()
	updated.CodigoOS = "OS-999"

	cliente := sampleCliente2()
	tabela := sampleTabela()

	findCallCount := 0
	repo := &mockOrdemDeServicoRepo{
		findByIDFn: func(id uint) (*models.OrdemDeServico, error) {
			findCallCount++
			if findCallCount == 1 {
				return &existing, nil
			}
			return &updated, nil
		},
		updateFn: func(o *models.OrdemDeServico) error { return nil },
	}
	clienteRepo := &mockClienteRepo{
		findByIDFn: func(id uint) (*models.Cliente, error) { return &cliente, nil },
	}
	tabelaRepo := &mockTabelaMontagemRepo{
		findByIDFn: func(id uint) (*models.TabelaMontagem, error) { return &tabela, nil },
	}
	uc := newOrdemUseCase(repo, clienteRepo, tabelaRepo)

	req := &dto.UpdateOrdemDeServicoRequest{
		CodigoOS:         "OS-999",
		ClienteID:        1,
		TabelaMontagemID: uintPtr(1),
		UsuarioID:        1,
	}
	result, err := uc.Update(1, req)

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if result.CodigoOS != "OS-999" {
		t.Errorf("codigoOS esperado %q, obteve %q", "OS-999", result.CodigoOS)
	}
}

func TestOrdemUpdate_NotFound(t *testing.T) {
	repo := &mockOrdemDeServicoRepo{
		findByIDFn: func(id uint) (*models.OrdemDeServico, error) { return nil, gorm.ErrRecordNotFound },
	}
	uc := newOrdemUseCase(repo, &mockClienteRepo{}, &mockTabelaMontagemRepo{})

	req := &dto.UpdateOrdemDeServicoRequest{
		CodigoOS:         "OS-X",
		ClienteID:        1,
		TabelaMontagemID: uintPtr(1),
		UsuarioID:        1,
	}
	_, err := uc.Update(99, req)

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		t.Errorf("esperado gorm.ErrRecordNotFound, obteve %v", err)
	}
}

func TestOrdemUpdate_ClienteNotFound(t *testing.T) {
	existing := sampleOrdem()
	repo := &mockOrdemDeServicoRepo{
		findByIDFn: func(id uint) (*models.OrdemDeServico, error) { return &existing, nil },
	}
	clienteRepo := &mockClienteRepo{
		findByIDFn: func(id uint) (*models.Cliente, error) { return nil, gorm.ErrRecordNotFound },
	}
	uc := newOrdemUseCase(repo, clienteRepo, &mockTabelaMontagemRepo{})

	req := &dto.UpdateOrdemDeServicoRequest{
		CodigoOS:         "OS-X",
		ClienteID:        99,
		TabelaMontagemID: uintPtr(1),
		UsuarioID:        1,
	}
	_, err := uc.Update(1, req)

	if err == nil {
		t.Fatal("esperado erro, obteve nil")
	}
}

func TestOrdemUpdate_RepoError(t *testing.T) {
	existing := sampleOrdem()
	repoErr := errors.New("update failed")
	cliente := sampleCliente2()
	tabela := sampleTabela()

	repo := &mockOrdemDeServicoRepo{
		findByIDFn: func(id uint) (*models.OrdemDeServico, error) { return &existing, nil },
		updateFn:   func(o *models.OrdemDeServico) error { return repoErr },
	}
	clienteRepo := &mockClienteRepo{
		findByIDFn: func(id uint) (*models.Cliente, error) { return &cliente, nil },
	}
	tabelaRepo := &mockTabelaMontagemRepo{
		findByIDFn: func(id uint) (*models.TabelaMontagem, error) { return &tabela, nil },
	}
	uc := newOrdemUseCase(repo, clienteRepo, tabelaRepo)

	req := &dto.UpdateOrdemDeServicoRequest{
		CodigoOS:         "OS-001",
		ClienteID:        1,
		TabelaMontagemID: uintPtr(1),
		UsuarioID:        1,
	}
	_, err := uc.Update(1, req)

	if !errors.Is(err, repoErr) {
		t.Errorf("erro esperado %v, obteve %v", repoErr, err)
	}
}

// ── Delete ────────────────────────────────────────────────────────────────────

func TestOrdemDelete_Success(t *testing.T) {
	existing := sampleOrdem()
	repo := &mockOrdemDeServicoRepo{
		findByIDFn: func(id uint) (*models.OrdemDeServico, error) { return &existing, nil },
		deleteFn:   func(id uint) error { return nil },
	}
	uc := newOrdemUseCase(repo, &mockClienteRepo{}, &mockTabelaMontagemRepo{})

	if err := uc.Delete(1); err != nil {
		t.Errorf("esperado sem erro, obteve: %v", err)
	}
}

func TestOrdemDelete_NotFound(t *testing.T) {
	repo := &mockOrdemDeServicoRepo{
		findByIDFn: func(id uint) (*models.OrdemDeServico, error) { return nil, gorm.ErrRecordNotFound },
	}
	uc := newOrdemUseCase(repo, &mockClienteRepo{}, &mockTabelaMontagemRepo{})

	err := uc.Delete(99)

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		t.Errorf("esperado gorm.ErrRecordNotFound, obteve %v", err)
	}
}

func TestOrdemDelete_RepoError(t *testing.T) {
	existing := sampleOrdem()
	repoErr := errors.New("delete failed")
	repo := &mockOrdemDeServicoRepo{
		findByIDFn: func(id uint) (*models.OrdemDeServico, error) { return &existing, nil },
		deleteFn:   func(id uint) error { return repoErr },
	}
	uc := newOrdemUseCase(repo, &mockClienteRepo{}, &mockTabelaMontagemRepo{})

	err := uc.Delete(1)

	if !errors.Is(err, repoErr) {
		t.Errorf("erro esperado %v, obteve %v", repoErr, err)
	}
}

// ── toOrdemDeServicoResponse mapping ─────────────────────────────────────────

func TestOrdemMapping_ValorNil(t *testing.T) {
	o := sampleOrdem()
	o.Valor = nil
	ordens := []models.OrdemDeServico{o}

	repo := &mockOrdemDeServicoRepo{
		findAllFn: func() ([]models.OrdemDeServico, error) { return ordens, nil },
	}
	uc := newOrdemUseCase(repo, &mockClienteRepo{}, &mockTabelaMontagemRepo{})

	result, err := uc.GetAll()

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if result[0].Valor != nil {
		t.Errorf("esperado valor nil, obteve %v", result[0].Valor)
	}
}

func TestOrdemMapping_ClienteNome(t *testing.T) {
	o := sampleOrdem()
	o.Cliente.Nome = "Empresa LTDA"
	ordens := []models.OrdemDeServico{o}

	repo := &mockOrdemDeServicoRepo{
		findAllFn: func() ([]models.OrdemDeServico, error) { return ordens, nil },
	}
	uc := newOrdemUseCase(repo, &mockClienteRepo{}, &mockTabelaMontagemRepo{})

	result, err := uc.GetAll()

	if err != nil {
		t.Fatalf("esperado sem erro, obteve: %v", err)
	}
	if result[0].Cliente.Nome != "Empresa LTDA" {
		t.Errorf("nome do cliente esperado %q, obteve %q", "Empresa LTDA", result[0].Cliente.Nome)
	}
}
