package handler

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/zorde/api/internal/dto"
	"gorm.io/gorm"
)

// ── mock ──────────────────────────────────────────────────────────────────────

type mockTabelaMontagemUseCase struct {
	getAllFn  func(page, limit int, search string) (*dto.TabelaMontagemListResponse, error)
	getByIDFn func(id uint) (*dto.TabelaMontagemResponse, error)
	createFn  func(req *dto.CreateTabelaMontagemRequest) (*dto.TabelaMontagemResponse, error)
	updateFn  func(id uint, req *dto.UpdateTabelaMontagemRequest) (*dto.TabelaMontagemResponse, error)
	deleteFn  func(id uint) error
}

func (m *mockTabelaMontagemUseCase) GetAll(page, limit int, search string) (*dto.TabelaMontagemListResponse, error) {
	return m.getAllFn(page, limit, search)
}
func (m *mockTabelaMontagemUseCase) GetByID(id uint) (*dto.TabelaMontagemResponse, error) {
	return m.getByIDFn(id)
}
func (m *mockTabelaMontagemUseCase) Create(req *dto.CreateTabelaMontagemRequest) (*dto.TabelaMontagemResponse, error) {
	return m.createFn(req)
}
func (m *mockTabelaMontagemUseCase) Update(id uint, req *dto.UpdateTabelaMontagemRequest) (*dto.TabelaMontagemResponse, error) {
	return m.updateFn(id, req)
}
func (m *mockTabelaMontagemUseCase) Delete(id uint) error {
	return m.deleteFn(id)
}

// ── helpers ───────────────────────────────────────────────────────────────────

func sampleTabelaMontagemResponse() dto.TabelaMontagemResponse {
	now := time.Now()
	return dto.TabelaMontagemResponse{
		ID:          1,
		ClienteID:   10,
		NomeCliente: "João Silva",
		Servico:     "MONTAGEM SIMPLES",
		Valor:       150.00,
		CreatedAt:   now,
	}
}

// ── GetAll ────────────────────────────────────────────────────────────────────

func TestTabelaMontagemHandler_GetAll_Success(t *testing.T) {
	sample := sampleTabelaMontagemResponse()
	uc := &mockTabelaMontagemUseCase{
		getAllFn: func(page, limit int, search string) (*dto.TabelaMontagemListResponse, error) {
			return &dto.TabelaMontagemListResponse{Items: []dto.TabelaMontagemResponse{sample}, Total: 1}, nil
		},
	}
	h := NewTabelaMontagemHandler(uc)

	w := httptest.NewRecorder()
	h.GetAll(w, newRequest(http.MethodGet, "/tabela-montagem", nil))

	if w.Code != http.StatusOK {
		t.Errorf("status esperado %d, obteve %d", http.StatusOK, w.Code)
	}
	var result dto.TabelaMontagemListResponse
	decodeBody(t, w.Body, &result)
	if len(result.Items) != 1 {
		t.Errorf("esperado 1 item, obteve %d", len(result.Items))
	}
	if result.Total != 1 {
		t.Errorf("total esperado 1, obteve %d", result.Total)
	}
}

func TestTabelaMontagemHandler_GetAll_Error(t *testing.T) {
	uc := &mockTabelaMontagemUseCase{
		getAllFn: func(page, limit int, search string) (*dto.TabelaMontagemListResponse, error) {
			return nil, errors.New("db error")
		},
	}
	h := NewTabelaMontagemHandler(uc)

	w := httptest.NewRecorder()
	h.GetAll(w, newRequest(http.MethodGet, "/tabela-montagem", nil))

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status esperado %d, obteve %d", http.StatusInternalServerError, w.Code)
	}
}

// ── Create ────────────────────────────────────────────────────────────────────

func TestTabelaMontagemHandler_Create_Success(t *testing.T) {
	sample := sampleTabelaMontagemResponse()
	uc := &mockTabelaMontagemUseCase{
		createFn: func(req *dto.CreateTabelaMontagemRequest) (*dto.TabelaMontagemResponse, error) {
			return &sample, nil
		},
	}
	h := NewTabelaMontagemHandler(uc)

	body := dto.CreateTabelaMontagemRequest{
		ClienteID: 10,
		Servico:   "MONTAGEM SIMPLES",
		Valor:     150.00,
	}
	w := httptest.NewRecorder()
	h.Create(w, newRequest(http.MethodPost, "/tabela-montagem", body))

	if w.Code != http.StatusCreated {
		t.Errorf("status esperado %d, obteve %d", http.StatusCreated, w.Code)
	}
	var result dto.TabelaMontagemResponse
	decodeBody(t, w.Body, &result)
	if result.ID != sample.ID {
		t.Errorf("ID esperado %d, obteve %d", sample.ID, result.ID)
	}
}

func TestTabelaMontagemHandler_Create_InvalidBody(t *testing.T) {
	h := NewTabelaMontagemHandler(&mockTabelaMontagemUseCase{})

	req := httptest.NewRequest(http.MethodPost, "/tabela-montagem", nil)
	w := httptest.NewRecorder()
	h.Create(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status esperado %d, obteve %d", http.StatusBadRequest, w.Code)
	}
}

func TestTabelaMontagemHandler_Create_ValidationError(t *testing.T) {
	h := NewTabelaMontagemHandler(&mockTabelaMontagemUseCase{})

	// ClienteID=0 falha na validação required
	body := dto.CreateTabelaMontagemRequest{
		ClienteID: 0,
		Servico:   "MONTAGEM SIMPLES",
		Valor:     150.00,
	}
	w := httptest.NewRecorder()
	h.Create(w, newRequest(http.MethodPost, "/tabela-montagem", body))

	if w.Code != http.StatusUnprocessableEntity {
		t.Errorf("status esperado %d, obteve %d", http.StatusUnprocessableEntity, w.Code)
	}
}

func TestTabelaMontagemHandler_Create_ServiceError(t *testing.T) {
	uc := &mockTabelaMontagemUseCase{
		createFn: func(req *dto.CreateTabelaMontagemRequest) (*dto.TabelaMontagemResponse, error) {
			return nil, errors.New("tipo de serviço inválido")
		},
	}
	h := NewTabelaMontagemHandler(uc)

	body := dto.CreateTabelaMontagemRequest{
		ClienteID: 10,
		Servico:   "INVALIDO",
		Valor:     150.00,
	}
	w := httptest.NewRecorder()
	h.Create(w, newRequest(http.MethodPost, "/tabela-montagem", body))

	if w.Code != http.StatusBadRequest {
		t.Errorf("status esperado %d, obteve %d", http.StatusBadRequest, w.Code)
	}
}

// ── Update ────────────────────────────────────────────────────────────────────

func TestTabelaMontagemHandler_Update_Success(t *testing.T) {
	sample := sampleTabelaMontagemResponse()
	uc := &mockTabelaMontagemUseCase{
		updateFn: func(id uint, req *dto.UpdateTabelaMontagemRequest) (*dto.TabelaMontagemResponse, error) {
			return &sample, nil
		},
	}
	h := NewTabelaMontagemHandler(uc)

	body := dto.UpdateTabelaMontagemRequest{
		ClienteID: 10,
		Servico:   "PARAFUSO",
		Valor:     200.00,
	}
	req := newRequest(http.MethodPut, "/tabela-montagem/1", body)
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.Update(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status esperado %d, obteve %d", http.StatusOK, w.Code)
	}
}

func TestTabelaMontagemHandler_Update_NotFound(t *testing.T) {
	uc := &mockTabelaMontagemUseCase{
		updateFn: func(id uint, req *dto.UpdateTabelaMontagemRequest) (*dto.TabelaMontagemResponse, error) {
			return nil, gorm.ErrRecordNotFound
		},
	}
	h := NewTabelaMontagemHandler(uc)

	body := dto.UpdateTabelaMontagemRequest{
		ClienteID: 10,
		Servico:   "PARAFUSO",
		Valor:     200.00,
	}
	req := newRequest(http.MethodPut, "/tabela-montagem/99", body)
	req.SetPathValue("id", "99")
	w := httptest.NewRecorder()
	h.Update(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status esperado %d, obteve %d", http.StatusNotFound, w.Code)
	}
}

func TestTabelaMontagemHandler_Update_InvalidID(t *testing.T) {
	h := NewTabelaMontagemHandler(&mockTabelaMontagemUseCase{})

	req := newRequest(http.MethodPut, "/tabela-montagem/abc", dto.UpdateTabelaMontagemRequest{ClienteID: 1, Servico: "PARAFUSO", Valor: 10})
	req.SetPathValue("id", "abc")
	w := httptest.NewRecorder()
	h.Update(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status esperado %d, obteve %d", http.StatusBadRequest, w.Code)
	}
}

// ── Delete ────────────────────────────────────────────────────────────────────

func TestTabelaMontagemHandler_Delete_Success(t *testing.T) {
	uc := &mockTabelaMontagemUseCase{
		deleteFn: func(id uint) error { return nil },
	}
	h := NewTabelaMontagemHandler(uc)

	req := newRequest(http.MethodDelete, "/tabela-montagem/1", nil)
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.Delete(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status esperado %d, obteve %d", http.StatusOK, w.Code)
	}
}

func TestTabelaMontagemHandler_Delete_NotFound(t *testing.T) {
	uc := &mockTabelaMontagemUseCase{
		deleteFn: func(id uint) error { return gorm.ErrRecordNotFound },
	}
	h := NewTabelaMontagemHandler(uc)

	req := newRequest(http.MethodDelete, "/tabela-montagem/99", nil)
	req.SetPathValue("id", "99")
	w := httptest.NewRecorder()
	h.Delete(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status esperado %d, obteve %d", http.StatusNotFound, w.Code)
	}
}

func TestTabelaMontagemHandler_Delete_InvalidID(t *testing.T) {
	h := NewTabelaMontagemHandler(&mockTabelaMontagemUseCase{})

	req := newRequest(http.MethodDelete, "/tabela-montagem/abc", nil)
	req.SetPathValue("id", "abc")
	w := httptest.NewRecorder()
	h.Delete(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status esperado %d, obteve %d", http.StatusBadRequest, w.Code)
	}
}
