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

type mockClienteUseCase struct {
	getAllFn  func() ([]dto.ClienteResponse, error)
	getByIDFn func(id uint) (*dto.ClienteResponse, error)
	createFn  func(req *dto.CreateClienteRequest) (*dto.ClienteResponse, error)
	updateFn  func(id uint, req *dto.UpdateClienteRequest) (*dto.ClienteResponse, error)
	deleteFn  func(id uint) error
}

func (m *mockClienteUseCase) GetAll() ([]dto.ClienteResponse, error) {
	return m.getAllFn()
}
func (m *mockClienteUseCase) GetByID(id uint) (*dto.ClienteResponse, error) {
	return m.getByIDFn(id)
}
func (m *mockClienteUseCase) Create(req *dto.CreateClienteRequest) (*dto.ClienteResponse, error) {
	return m.createFn(req)
}
func (m *mockClienteUseCase) Update(id uint, req *dto.UpdateClienteRequest) (*dto.ClienteResponse, error) {
	return m.updateFn(id, req)
}
func (m *mockClienteUseCase) Delete(id uint) error {
	return m.deleteFn(id)
}

// ── helpers ───────────────────────────────────────────────────────────────────

func sampleClienteResponse() dto.ClienteResponse {
	now := time.Now()
	return dto.ClienteResponse{
		ID:         1,
		Nome:       "João Silva",
		Email:      "joao@example.com",
		TipoPessoa: "FISICA",
		Documento:  "12345678901",
		Status:     "ATIVO",
		CreatedAt:  now,
	}
}

func newRequest(method, target string, body any) *http.Request {
	var buf bytes.Buffer
	if body != nil {
		json.NewEncoder(&buf).Encode(body)
	}
	req := httptest.NewRequest(method, target, &buf)
	req.Header.Set("Content-Type", "application/json")
	return req
}

func decodeBody(t *testing.T, body *bytes.Buffer, v any) {
	t.Helper()
	if err := json.NewDecoder(body).Decode(v); err != nil {
		t.Fatalf("falha ao decodificar resposta: %v", err)
	}
}

// ── List ──────────────────────────────────────────────────────────────────────

func TestClienteHandler_List_Success(t *testing.T) {
	clientes := []dto.ClienteResponse{sampleClienteResponse()}
	uc := &mockClienteUseCase{
		getAllFn: func() ([]dto.ClienteResponse, error) { return clientes, nil },
	}
	h := NewClienteHandler(uc)

	w := httptest.NewRecorder()
	h.List(w, newRequest(http.MethodGet, "/clientes", nil))

	if w.Code != http.StatusOK {
		t.Errorf("status esperado %d, obteve %d", http.StatusOK, w.Code)
	}
	var result []dto.ClienteResponse
	decodeBody(t, w.Body, &result)
	if len(result) != 1 {
		t.Errorf("esperado 1 cliente, obteve %d", len(result))
	}
}

func TestClienteHandler_List_Empty(t *testing.T) {
	uc := &mockClienteUseCase{
		getAllFn: func() ([]dto.ClienteResponse, error) { return []dto.ClienteResponse{}, nil },
	}
	h := NewClienteHandler(uc)

	w := httptest.NewRecorder()
	h.List(w, newRequest(http.MethodGet, "/clientes", nil))

	if w.Code != http.StatusOK {
		t.Errorf("status esperado %d, obteve %d", http.StatusOK, w.Code)
	}
	var result []dto.ClienteResponse
	decodeBody(t, w.Body, &result)
	if len(result) != 0 {
		t.Errorf("esperado slice vazio, obteve %d itens", len(result))
	}
}

func TestClienteHandler_List_Error(t *testing.T) {
	uc := &mockClienteUseCase{
		getAllFn: func() ([]dto.ClienteResponse, error) { return nil, errors.New("db error") },
	}
	h := NewClienteHandler(uc)

	w := httptest.NewRecorder()
	h.List(w, newRequest(http.MethodGet, "/clientes", nil))

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status esperado %d, obteve %d", http.StatusInternalServerError, w.Code)
	}
}

// ── GetByID ───────────────────────────────────────────────────────────────────

func TestClienteHandler_GetByID_Success(t *testing.T) {
	c := sampleClienteResponse()
	uc := &mockClienteUseCase{
		getByIDFn: func(id uint) (*dto.ClienteResponse, error) { return &c, nil },
	}
	h := NewClienteHandler(uc)

	req := httptest.NewRequest(http.MethodGet, "/clientes/1", nil)
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.GetByID(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status esperado %d, obteve %d", http.StatusOK, w.Code)
	}
	var result dto.ClienteResponse
	decodeBody(t, w.Body, &result)
	if result.ID != c.ID {
		t.Errorf("ID esperado %d, obteve %d", c.ID, result.ID)
	}
}

func TestClienteHandler_GetByID_InvalidID(t *testing.T) {
	h := NewClienteHandler(&mockClienteUseCase{})

	req := httptest.NewRequest(http.MethodGet, "/clientes/abc", nil)
	req.SetPathValue("id", "abc")
	w := httptest.NewRecorder()
	h.GetByID(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status esperado %d, obteve %d", http.StatusBadRequest, w.Code)
	}
}

func TestClienteHandler_GetByID_NotFound(t *testing.T) {
	uc := &mockClienteUseCase{
		getByIDFn: func(id uint) (*dto.ClienteResponse, error) { return nil, gorm.ErrRecordNotFound },
	}
	h := NewClienteHandler(uc)

	req := httptest.NewRequest(http.MethodGet, "/clientes/99", nil)
	req.SetPathValue("id", "99")
	w := httptest.NewRecorder()
	h.GetByID(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status esperado %d, obteve %d", http.StatusNotFound, w.Code)
	}
}

func TestClienteHandler_GetByID_Error(t *testing.T) {
	uc := &mockClienteUseCase{
		getByIDFn: func(id uint) (*dto.ClienteResponse, error) { return nil, errors.New("db error") },
	}
	h := NewClienteHandler(uc)

	req := httptest.NewRequest(http.MethodGet, "/clientes/1", nil)
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.GetByID(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status esperado %d, obteve %d", http.StatusInternalServerError, w.Code)
	}
}

// ── Create ────────────────────────────────────────────────────────────────────

func TestClienteHandler_Create_Success(t *testing.T) {
	c := sampleClienteResponse()
	uc := &mockClienteUseCase{
		createFn: func(req *dto.CreateClienteRequest) (*dto.ClienteResponse, error) { return &c, nil },
	}
	h := NewClienteHandler(uc)

	body := dto.CreateClienteRequest{
		Nome:       "João Silva",
		Email:      "joao@example.com",
		TipoPessoa: "FISICA",
		Documento:  "12345678901",
		Status:     "ATIVO",
		UsuarioID:  1,
	}
	w := httptest.NewRecorder()
	h.Create(w, newRequest(http.MethodPost, "/clientes", body))

	if w.Code != http.StatusCreated {
		t.Errorf("status esperado %d, obteve %d", http.StatusCreated, w.Code)
	}
	var result dto.ClienteResponse
	decodeBody(t, w.Body, &result)
	if result.Nome != c.Nome {
		t.Errorf("nome esperado %q, obteve %q", c.Nome, result.Nome)
	}
}

func TestClienteHandler_Create_InvalidBody(t *testing.T) {
	h := NewClienteHandler(&mockClienteUseCase{})

	req := httptest.NewRequest(http.MethodPost, "/clientes", bytes.NewBufferString("not json"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	h.Create(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status esperado %d, obteve %d", http.StatusBadRequest, w.Code)
	}
}

func TestClienteHandler_Create_ValidationError(t *testing.T) {
	h := NewClienteHandler(&mockClienteUseCase{})

	// Email inválido e campos obrigatórios ausentes
	body := map[string]any{
		"nome":  "João",
		"email": "nao-e-email",
	}
	w := httptest.NewRecorder()
	h.Create(w, newRequest(http.MethodPost, "/clientes", body))

	if w.Code != http.StatusUnprocessableEntity {
		t.Errorf("status esperado %d, obteve %d", http.StatusUnprocessableEntity, w.Code)
	}
}

func TestClienteHandler_Create_UseCaseError(t *testing.T) {
	uc := &mockClienteUseCase{
		createFn: func(req *dto.CreateClienteRequest) (*dto.ClienteResponse, error) {
			return nil, errors.New("db error")
		},
	}
	h := NewClienteHandler(uc)

	body := dto.CreateClienteRequest{
		Nome:       "João Silva",
		Email:      "joao@example.com",
		TipoPessoa: "FISICA",
		Documento:  "12345678901",
		UsuarioID:  1,
	}
	w := httptest.NewRecorder()
	h.Create(w, newRequest(http.MethodPost, "/clientes", body))

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status esperado %d, obteve %d", http.StatusInternalServerError, w.Code)
	}
}

// ── Update ────────────────────────────────────────────────────────────────────

func TestClienteHandler_Update_Success(t *testing.T) {
	c := sampleClienteResponse()
	c.Nome = "João Atualizado"
	uc := &mockClienteUseCase{
		updateFn: func(id uint, req *dto.UpdateClienteRequest) (*dto.ClienteResponse, error) { return &c, nil },
	}
	h := NewClienteHandler(uc)

	body := dto.UpdateClienteRequest{
		Nome:       "João Atualizado",
		Email:      "joao@example.com",
		TipoPessoa: "FISICA",
		Documento:  "12345678901",
		UsuarioID:  1,
	}
	req := httptest.NewRequest(http.MethodPut, "/clientes/1", nil)
	req.SetPathValue("id", "1")
	// Recriar com body
	var buf bytes.Buffer
	json.NewEncoder(&buf).Encode(body)
	req2 := httptest.NewRequest(http.MethodPut, "/clientes/1", &buf)
	req2.Header.Set("Content-Type", "application/json")
	req2.SetPathValue("id", "1")

	w := httptest.NewRecorder()
	h.Update(w, req2)

	if w.Code != http.StatusOK {
		t.Errorf("status esperado %d, obteve %d", http.StatusOK, w.Code)
	}
	var result dto.ClienteResponse
	decodeBody(t, w.Body, &result)
	if result.Nome != c.Nome {
		t.Errorf("nome esperado %q, obteve %q", c.Nome, result.Nome)
	}
}

func TestClienteHandler_Update_InvalidID(t *testing.T) {
	h := NewClienteHandler(&mockClienteUseCase{})

	req := httptest.NewRequest(http.MethodPut, "/clientes/abc", nil)
	req.SetPathValue("id", "abc")
	w := httptest.NewRecorder()
	h.Update(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status esperado %d, obteve %d", http.StatusBadRequest, w.Code)
	}
}

func TestClienteHandler_Update_NotFound(t *testing.T) {
	uc := &mockClienteUseCase{
		updateFn: func(id uint, req *dto.UpdateClienteRequest) (*dto.ClienteResponse, error) {
			return nil, gorm.ErrRecordNotFound
		},
	}
	h := NewClienteHandler(uc)

	body := dto.UpdateClienteRequest{
		Nome:       "X",
		Email:      "x@example.com",
		TipoPessoa: "FISICA",
		Documento:  "12345678901",
		UsuarioID:  1,
	}
	var buf bytes.Buffer
	json.NewEncoder(&buf).Encode(body)
	req := httptest.NewRequest(http.MethodPut, "/clientes/99", &buf)
	req.Header.Set("Content-Type", "application/json")
	req.SetPathValue("id", "99")
	w := httptest.NewRecorder()
	h.Update(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status esperado %d, obteve %d", http.StatusNotFound, w.Code)
	}
}

func TestClienteHandler_Update_UseCaseError(t *testing.T) {
	uc := &mockClienteUseCase{
		updateFn: func(id uint, req *dto.UpdateClienteRequest) (*dto.ClienteResponse, error) {
			return nil, errors.New("db error")
		},
	}
	h := NewClienteHandler(uc)

	body := dto.UpdateClienteRequest{
		Nome:       "João Silva",
		Email:      "joao@example.com",
		TipoPessoa: "FISICA",
		Documento:  "12345678901",
		UsuarioID:  1,
	}
	var buf bytes.Buffer
	json.NewEncoder(&buf).Encode(body)
	req := httptest.NewRequest(http.MethodPut, "/clientes/1", &buf)
	req.Header.Set("Content-Type", "application/json")
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.Update(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status esperado %d, obteve %d", http.StatusInternalServerError, w.Code)
	}
}

// ── Delete ────────────────────────────────────────────────────────────────────

func TestClienteHandler_Delete_Success(t *testing.T) {
	uc := &mockClienteUseCase{
		deleteFn: func(id uint) error { return nil },
	}
	h := NewClienteHandler(uc)

	req := httptest.NewRequest(http.MethodDelete, "/clientes/1", nil)
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.Delete(w, req)

	if w.Code != http.StatusNoContent {
		t.Errorf("status esperado %d, obteve %d", http.StatusNoContent, w.Code)
	}
}

func TestClienteHandler_Delete_InvalidID(t *testing.T) {
	h := NewClienteHandler(&mockClienteUseCase{})

	req := httptest.NewRequest(http.MethodDelete, "/clientes/abc", nil)
	req.SetPathValue("id", "abc")
	w := httptest.NewRecorder()
	h.Delete(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status esperado %d, obteve %d", http.StatusBadRequest, w.Code)
	}
}

func TestClienteHandler_Delete_NotFound(t *testing.T) {
	uc := &mockClienteUseCase{
		deleteFn: func(id uint) error { return gorm.ErrRecordNotFound },
	}
	h := NewClienteHandler(uc)

	req := httptest.NewRequest(http.MethodDelete, "/clientes/99", nil)
	req.SetPathValue("id", "99")
	w := httptest.NewRecorder()
	h.Delete(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status esperado %d, obteve %d", http.StatusNotFound, w.Code)
	}
}

func TestClienteHandler_Delete_Error(t *testing.T) {
	uc := &mockClienteUseCase{
		deleteFn: func(id uint) error { return errors.New("db error") },
	}
	h := NewClienteHandler(uc)

	req := httptest.NewRequest(http.MethodDelete, "/clientes/1", nil)
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.Delete(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status esperado %d, obteve %d", http.StatusInternalServerError, w.Code)
	}
}
