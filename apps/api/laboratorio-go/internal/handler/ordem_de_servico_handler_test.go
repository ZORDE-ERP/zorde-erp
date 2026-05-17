package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/zorde/api/internal/dto"
	"gorm.io/gorm"
)

// ── mock ──────────────────────────────────────────────────────────────────────

type mockOrdemDeServicoUseCase struct {
	getAllFn  func() ([]dto.OrdemDeServicoResponse, error)
	getByIDFn func(id uint) (*dto.OrdemDeServicoResponse, error)
	createFn  func(req *dto.CreateOrdemDeServicoRequest) (*dto.OrdemDeServicoResponse, error)
	updateFn  func(id uint, req *dto.UpdateOrdemDeServicoRequest) (*dto.OrdemDeServicoResponse, error)
	deleteFn  func(id uint) error
}

func (m *mockOrdemDeServicoUseCase) GetAll() ([]dto.OrdemDeServicoResponse, error) {
	return m.getAllFn()
}
func (m *mockOrdemDeServicoUseCase) GetByID(id uint) (*dto.OrdemDeServicoResponse, error) {
	return m.getByIDFn(id)
}
func (m *mockOrdemDeServicoUseCase) Create(req *dto.CreateOrdemDeServicoRequest) (*dto.OrdemDeServicoResponse, error) {
	return m.createFn(req)
}
func (m *mockOrdemDeServicoUseCase) Update(id uint, req *dto.UpdateOrdemDeServicoRequest) (*dto.OrdemDeServicoResponse, error) {
	return m.updateFn(id, req)
}
func (m *mockOrdemDeServicoUseCase) Delete(id uint) error {
	return m.deleteFn(id)
}

// ── helpers ───────────────────────────────────────────────────────────────────

func uintPtr(u uint) *uint { return &u }

func sampleOrdemResponse() dto.OrdemDeServicoResponse {
	now := time.Now()
	val := 150.0
	return dto.OrdemDeServicoResponse{
		ID:        1,
		CodigoOS:  "OS-001",
		ClienteID: 1,
		Cliente: dto.ClienteRefResponse{
			ID:   1,
			Nome: "João Silva",
		},
		Valor:            &val,
		TabelaMontagemID: uintPtr(1),
		TabelaMontagem: &dto.TabelaMontagemRefResponse{
			ID:      uintPtr(1),
			Servico: "MONTAGEM SIMPLES",
		},
		CreatedAt: now,
	}
}

func validCreateOrdemBody() dto.CreateOrdemDeServicoRequest {
	val := 150.0
	return dto.CreateOrdemDeServicoRequest{
		CodigoOS:         "OS-001",
		ClienteID:        1,
		Valor:            &val,
		TabelaMontagemID: uintPtr(1),
		UsuarioID:        1,
	}
}

func validUpdateOrdemBody() dto.UpdateOrdemDeServicoRequest {
	val := 200.0
	return dto.UpdateOrdemDeServicoRequest{
		CodigoOS:         "OS-002",
		ClienteID:        1,
		Valor:            &val,
		TabelaMontagemID: uintPtr(1),
		UsuarioID:        1,
	}
}

// ── List ──────────────────────────────────────────────────────────────────────

func TestOrdemHandler_List_Success(t *testing.T) {
	ordens := []dto.OrdemDeServicoResponse{sampleOrdemResponse()}
	uc := &mockOrdemDeServicoUseCase{
		getAllFn: func() ([]dto.OrdemDeServicoResponse, error) { return ordens, nil },
	}
	h := NewOrdemDeServicoHandler(uc)

	w := httptest.NewRecorder()
	h.List(w, newRequest(http.MethodGet, "/ordens-de-servico", nil))

	if w.Code != http.StatusOK {
		t.Errorf("status esperado %d, obteve %d", http.StatusOK, w.Code)
	}
	var result []dto.OrdemDeServicoResponse
	decodeBody(t, w.Body, &result)
	if len(result) != 1 {
		t.Errorf("esperado 1 ordem, obteve %d", len(result))
	}
}

func TestOrdemHandler_List_Empty(t *testing.T) {
	uc := &mockOrdemDeServicoUseCase{
		getAllFn: func() ([]dto.OrdemDeServicoResponse, error) { return []dto.OrdemDeServicoResponse{}, nil },
	}
	h := NewOrdemDeServicoHandler(uc)

	w := httptest.NewRecorder()
	h.List(w, newRequest(http.MethodGet, "/ordens-de-servico", nil))

	if w.Code != http.StatusOK {
		t.Errorf("status esperado %d, obteve %d", http.StatusOK, w.Code)
	}
	var result []dto.OrdemDeServicoResponse
	decodeBody(t, w.Body, &result)
	if len(result) != 0 {
		t.Errorf("esperado slice vazio, obteve %d itens", len(result))
	}
}

func TestOrdemHandler_List_Error(t *testing.T) {
	uc := &mockOrdemDeServicoUseCase{
		getAllFn: func() ([]dto.OrdemDeServicoResponse, error) { return nil, errors.New("db error") },
	}
	h := NewOrdemDeServicoHandler(uc)

	w := httptest.NewRecorder()
	h.List(w, newRequest(http.MethodGet, "/ordens-de-servico", nil))

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status esperado %d, obteve %d", http.StatusInternalServerError, w.Code)
	}
}

// ── GetByID ───────────────────────────────────────────────────────────────────

func TestOrdemHandler_GetByID_Success(t *testing.T) {
	o := sampleOrdemResponse()
	uc := &mockOrdemDeServicoUseCase{
		getByIDFn: func(id uint) (*dto.OrdemDeServicoResponse, error) { return &o, nil },
	}
	h := NewOrdemDeServicoHandler(uc)

	req := httptest.NewRequest(http.MethodGet, "/ordens-de-servico/1", nil)
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.GetByID(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status esperado %d, obteve %d", http.StatusOK, w.Code)
	}
	var result dto.OrdemDeServicoResponse
	decodeBody(t, w.Body, &result)
	if result.ID != o.ID {
		t.Errorf("ID esperado %d, obteve %d", o.ID, result.ID)
	}
}

func TestOrdemHandler_GetByID_InvalidID(t *testing.T) {
	h := NewOrdemDeServicoHandler(&mockOrdemDeServicoUseCase{})

	req := httptest.NewRequest(http.MethodGet, "/ordens-de-servico/abc", nil)
	req.SetPathValue("id", "abc")
	w := httptest.NewRecorder()
	h.GetByID(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status esperado %d, obteve %d", http.StatusBadRequest, w.Code)
	}
}

func TestOrdemHandler_GetByID_NotFound(t *testing.T) {
	uc := &mockOrdemDeServicoUseCase{
		getByIDFn: func(id uint) (*dto.OrdemDeServicoResponse, error) { return nil, gorm.ErrRecordNotFound },
	}
	h := NewOrdemDeServicoHandler(uc)

	req := httptest.NewRequest(http.MethodGet, "/ordens-de-servico/99", nil)
	req.SetPathValue("id", "99")
	w := httptest.NewRecorder()
	h.GetByID(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status esperado %d, obteve %d", http.StatusNotFound, w.Code)
	}
}

func TestOrdemHandler_GetByID_Error(t *testing.T) {
	uc := &mockOrdemDeServicoUseCase{
		getByIDFn: func(id uint) (*dto.OrdemDeServicoResponse, error) { return nil, errors.New("db error") },
	}
	h := NewOrdemDeServicoHandler(uc)

	req := httptest.NewRequest(http.MethodGet, "/ordens-de-servico/1", nil)
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.GetByID(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status esperado %d, obteve %d", http.StatusInternalServerError, w.Code)
	}
}

// ── Create ────────────────────────────────────────────────────────────────────

func TestOrdemHandler_Create_Success(t *testing.T) {
	o := sampleOrdemResponse()
	uc := &mockOrdemDeServicoUseCase{
		createFn: func(req *dto.CreateOrdemDeServicoRequest) (*dto.OrdemDeServicoResponse, error) { return &o, nil },
	}
	h := NewOrdemDeServicoHandler(uc)

	w := httptest.NewRecorder()
	h.Create(w, newRequest(http.MethodPost, "/ordens-de-servico", validCreateOrdemBody()))

	if w.Code != http.StatusCreated {
		t.Errorf("status esperado %d, obteve %d", http.StatusCreated, w.Code)
	}
	var result dto.OrdemDeServicoResponse
	decodeBody(t, w.Body, &result)
	if result.CodigoOS != o.CodigoOS {
		t.Errorf("codigoOS esperado %q, obteve %q", o.CodigoOS, result.CodigoOS)
	}
}

func TestOrdemHandler_Create_InvalidBody(t *testing.T) {
	h := NewOrdemDeServicoHandler(&mockOrdemDeServicoUseCase{})

	req := httptest.NewRequest(http.MethodPost, "/ordens-de-servico", bytes.NewBufferString("not json"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	h.Create(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status esperado %d, obteve %d", http.StatusBadRequest, w.Code)
	}
}

func TestOrdemHandler_Create_ValidationError(t *testing.T) {
	h := NewOrdemDeServicoHandler(&mockOrdemDeServicoUseCase{})

	// campos obrigatórios ausentes
	body := map[string]any{"codigoOS": ""}
	w := httptest.NewRecorder()
	h.Create(w, newRequest(http.MethodPost, "/ordens-de-servico", body))

	if w.Code != http.StatusUnprocessableEntity {
		t.Errorf("status esperado %d, obteve %d", http.StatusUnprocessableEntity, w.Code)
	}
}

func TestOrdemHandler_Create_RelacaoNaoEncontrada(t *testing.T) {
	uc := &mockOrdemDeServicoUseCase{
		createFn: func(req *dto.CreateOrdemDeServicoRequest) (*dto.OrdemDeServicoResponse, error) {
			return nil, gorm.ErrRecordNotFound
		},
	}
	h := NewOrdemDeServicoHandler(uc)

	w := httptest.NewRecorder()
	h.Create(w, newRequest(http.MethodPost, "/ordens-de-servico", validCreateOrdemBody()))

	if w.Code != http.StatusUnprocessableEntity {
		t.Errorf("status esperado %d, obteve %d", http.StatusUnprocessableEntity, w.Code)
	}
}

func TestOrdemHandler_Create_UseCaseError(t *testing.T) {
	uc := &mockOrdemDeServicoUseCase{
		createFn: func(req *dto.CreateOrdemDeServicoRequest) (*dto.OrdemDeServicoResponse, error) {
			return nil, errors.New("cliente com id 99 não encontrado")
		},
	}
	h := NewOrdemDeServicoHandler(uc)

	w := httptest.NewRecorder()
	h.Create(w, newRequest(http.MethodPost, "/ordens-de-servico", validCreateOrdemBody()))

	if w.Code != http.StatusUnprocessableEntity {
		t.Errorf("status esperado %d, obteve %d", http.StatusUnprocessableEntity, w.Code)
	}
}

// ── Update ────────────────────────────────────────────────────────────────────

func TestOrdemHandler_Update_Success(t *testing.T) {
	o := sampleOrdemResponse()
	o.CodigoOS = "OS-002"
	uc := &mockOrdemDeServicoUseCase{
		updateFn: func(id uint, req *dto.UpdateOrdemDeServicoRequest) (*dto.OrdemDeServicoResponse, error) {
			return &o, nil
		},
	}
	h := NewOrdemDeServicoHandler(uc)

	body := validUpdateOrdemBody()
	var buf bytes.Buffer
	json.NewEncoder(&buf).Encode(body)
	req := httptest.NewRequest(http.MethodPut, "/ordens-de-servico/1", &buf)
	req.Header.Set("Content-Type", "application/json")
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.Update(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status esperado %d, obteve %d", http.StatusOK, w.Code)
	}
	var result dto.OrdemDeServicoResponse
	decodeBody(t, w.Body, &result)
	if result.CodigoOS != "OS-002" {
		t.Errorf("codigoOS esperado %q, obteve %q", "OS-002", result.CodigoOS)
	}
}

func TestOrdemHandler_Update_InvalidID(t *testing.T) {
	h := NewOrdemDeServicoHandler(&mockOrdemDeServicoUseCase{})

	req := httptest.NewRequest(http.MethodPut, "/ordens-de-servico/abc", nil)
	req.SetPathValue("id", "abc")
	w := httptest.NewRecorder()
	h.Update(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status esperado %d, obteve %d", http.StatusBadRequest, w.Code)
	}
}

func TestOrdemHandler_Update_InvalidBody(t *testing.T) {
	h := NewOrdemDeServicoHandler(&mockOrdemDeServicoUseCase{})

	req := httptest.NewRequest(http.MethodPut, "/ordens-de-servico/1", bytes.NewBufferString("not json"))
	req.Header.Set("Content-Type", "application/json")
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.Update(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status esperado %d, obteve %d", http.StatusBadRequest, w.Code)
	}
}

func TestOrdemHandler_Update_ValidationError(t *testing.T) {
	h := NewOrdemDeServicoHandler(&mockOrdemDeServicoUseCase{})

	body := map[string]any{"codigoOS": ""}
	w := httptest.NewRecorder()
	r := newRequest(http.MethodPut, "/ordens-de-servico/1", body)
	r.SetPathValue("id", "1")
	h.Update(w, r)

	if w.Code != http.StatusUnprocessableEntity {
		t.Errorf("status esperado %d, obteve %d", http.StatusUnprocessableEntity, w.Code)
	}
}

func TestOrdemHandler_Update_NotFound(t *testing.T) {
	uc := &mockOrdemDeServicoUseCase{
		updateFn: func(id uint, req *dto.UpdateOrdemDeServicoRequest) (*dto.OrdemDeServicoResponse, error) {
			return nil, gorm.ErrRecordNotFound
		},
	}
	h := NewOrdemDeServicoHandler(uc)

	var buf bytes.Buffer
	json.NewEncoder(&buf).Encode(validUpdateOrdemBody())
	req := httptest.NewRequest(http.MethodPut, "/ordens-de-servico/99", &buf)
	req.Header.Set("Content-Type", "application/json")
	req.SetPathValue("id", "99")
	w := httptest.NewRecorder()
	h.Update(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status esperado %d, obteve %d", http.StatusNotFound, w.Code)
	}
}

func TestOrdemHandler_Update_UseCaseError(t *testing.T) {
	uc := &mockOrdemDeServicoUseCase{
		updateFn: func(id uint, req *dto.UpdateOrdemDeServicoRequest) (*dto.OrdemDeServicoResponse, error) {
			return nil, errors.New("tabela de montagem com id 99 não encontrada")
		},
	}
	h := NewOrdemDeServicoHandler(uc)

	var buf bytes.Buffer
	json.NewEncoder(&buf).Encode(validUpdateOrdemBody())
	req := httptest.NewRequest(http.MethodPut, "/ordens-de-servico/1", &buf)
	req.Header.Set("Content-Type", "application/json")
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.Update(w, req)

	if w.Code != http.StatusUnprocessableEntity {
		t.Errorf("status esperado %d, obteve %d", http.StatusUnprocessableEntity, w.Code)
	}
}

// ── Delete ────────────────────────────────────────────────────────────────────

func TestOrdemHandler_Delete_Success(t *testing.T) {
	uc := &mockOrdemDeServicoUseCase{
		deleteFn: func(id uint) error { return nil },
	}
	h := NewOrdemDeServicoHandler(uc)

	req := httptest.NewRequest(http.MethodDelete, "/ordens-de-servico/1", nil)
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.Delete(w, req)

	if w.Code != http.StatusNoContent {
		t.Errorf("status esperado %d, obteve %d", http.StatusNoContent, w.Code)
	}
}

func TestOrdemHandler_Delete_InvalidID(t *testing.T) {
	h := NewOrdemDeServicoHandler(&mockOrdemDeServicoUseCase{})

	req := httptest.NewRequest(http.MethodDelete, "/ordens-de-servico/abc", nil)
	req.SetPathValue("id", "abc")
	w := httptest.NewRecorder()
	h.Delete(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status esperado %d, obteve %d", http.StatusBadRequest, w.Code)
	}
}

func TestOrdemHandler_Delete_NotFound(t *testing.T) {
	uc := &mockOrdemDeServicoUseCase{
		deleteFn: func(id uint) error { return gorm.ErrRecordNotFound },
	}
	h := NewOrdemDeServicoHandler(uc)

	req := httptest.NewRequest(http.MethodDelete, "/ordens-de-servico/99", nil)
	req.SetPathValue("id", "99")
	w := httptest.NewRecorder()
	h.Delete(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status esperado %d, obteve %d", http.StatusNotFound, w.Code)
	}
}

func TestOrdemHandler_Delete_Error(t *testing.T) {
	uc := &mockOrdemDeServicoUseCase{
		deleteFn: func(id uint) error { return errors.New("db error") },
	}
	h := NewOrdemDeServicoHandler(uc)

	req := httptest.NewRequest(http.MethodDelete, "/ordens-de-servico/1", nil)
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.Delete(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status esperado %d, obteve %d", http.StatusInternalServerError, w.Code)
	}
}

// ── helper interno ────────────────────────────────────────────────────────────

func newRequestWithPathValue(method, target, id string, body any) *http.Request {
	req := newRequest(method, target, body)
	req.SetPathValue("id", id)
	return req
}
