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

type mockFornecedorUseCase struct {
	getAllFn  func() ([]dto.FornecedorResponse, error)
	getByIDFn func(id uint) (*dto.FornecedorResponse, error)
	createFn  func(req *dto.CreateFornecedorRequest) (*dto.FornecedorResponse, error)
	updateFn  func(id uint, req *dto.UpdateFornecedorRequest) (*dto.FornecedorResponse, error)
	deleteFn  func(id uint) error
}

func (m *mockFornecedorUseCase) GetAll() ([]dto.FornecedorResponse, error) {
	return m.getAllFn()
}
func (m *mockFornecedorUseCase) GetByID(id uint) (*dto.FornecedorResponse, error) {
	return m.getByIDFn(id)
}
func (m *mockFornecedorUseCase) Create(req *dto.CreateFornecedorRequest) (*dto.FornecedorResponse, error) {
	return m.createFn(req)
}
func (m *mockFornecedorUseCase) Update(id uint, req *dto.UpdateFornecedorRequest) (*dto.FornecedorResponse, error) {
	return m.updateFn(id, req)
}
func (m *mockFornecedorUseCase) Delete(id uint) error {
	return m.deleteFn(id)
}

// ── helpers ───────────────────────────────────────────────────────────────────

func sampleFornecedorResponse() dto.FornecedorResponse {
	now := time.Now()
	return dto.FornecedorResponse{
		ID:         1,
		Nome:       "Fornecedor Ltda",
		Email:      "fornecedor@example.com",
		TipoPessoa: "JURIDICA",
		Documento:  "12345678000195",
		Status:     "ATIVO",
		CreatedAt:  now,
	}
}

func newFornecedorRequest(method, target string, body any) *http.Request {
	var buf bytes.Buffer
	if body != nil {
		json.NewEncoder(&buf).Encode(body)
	}
	req := httptest.NewRequest(method, target, &buf)
	req.Header.Set("Content-Type", "application/json")
	return req
}

func decodeFornecedorBody(t *testing.T, body *bytes.Buffer, v any) {
	t.Helper()
	if err := json.NewDecoder(body).Decode(v); err != nil {
		t.Fatalf("falha ao decodificar resposta: %v", err)
	}
}

// ── List ──────────────────────────────────────────────────────────────────────

func TestFornecedorHandler_List_Success(t *testing.T) {
	fornecedores := []dto.FornecedorResponse{sampleFornecedorResponse()}
	uc := &mockFornecedorUseCase{
		getAllFn: func() ([]dto.FornecedorResponse, error) { return fornecedores, nil },
	}
	h := NewFornecedorHandler(uc)

	w := httptest.NewRecorder()
	h.List(w, newFornecedorRequest(http.MethodGet, "/fornecedores", nil))

	if w.Code != http.StatusOK {
		t.Errorf("status esperado %d, obteve %d", http.StatusOK, w.Code)
	}
	var result []dto.FornecedorResponse
	decodeFornecedorBody(t, w.Body, &result)
	if len(result) != 1 {
		t.Errorf("esperado 1 fornecedor, obteve %d", len(result))
	}
}

func TestFornecedorHandler_List_Empty(t *testing.T) {
	uc := &mockFornecedorUseCase{
		getAllFn: func() ([]dto.FornecedorResponse, error) { return []dto.FornecedorResponse{}, nil },
	}
	h := NewFornecedorHandler(uc)

	w := httptest.NewRecorder()
	h.List(w, newFornecedorRequest(http.MethodGet, "/fornecedores", nil))

	if w.Code != http.StatusOK {
		t.Errorf("status esperado %d, obteve %d", http.StatusOK, w.Code)
	}
	var result []dto.FornecedorResponse
	decodeFornecedorBody(t, w.Body, &result)
	if len(result) != 0 {
		t.Errorf("esperado slice vazio, obteve %d itens", len(result))
	}
}

func TestFornecedorHandler_List_NilReturnBecomesEmpty(t *testing.T) {
	uc := &mockFornecedorUseCase{
		getAllFn: func() ([]dto.FornecedorResponse, error) { return nil, nil },
	}
	h := NewFornecedorHandler(uc)

	w := httptest.NewRecorder()
	h.List(w, newFornecedorRequest(http.MethodGet, "/fornecedores", nil))

	if w.Code != http.StatusOK {
		t.Errorf("status esperado %d, obteve %d", http.StatusOK, w.Code)
	}
	var result []dto.FornecedorResponse
	decodeFornecedorBody(t, w.Body, &result)
	if result == nil {
		t.Error("esperado slice não-nil na resposta JSON")
	}
}

func TestFornecedorHandler_List_Error(t *testing.T) {
	uc := &mockFornecedorUseCase{
		getAllFn: func() ([]dto.FornecedorResponse, error) { return nil, errors.New("db error") },
	}
	h := NewFornecedorHandler(uc)

	w := httptest.NewRecorder()
	h.List(w, newFornecedorRequest(http.MethodGet, "/fornecedores", nil))

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status esperado %d, obteve %d", http.StatusInternalServerError, w.Code)
	}
}

// ── GetByID ───────────────────────────────────────────────────────────────────

func TestFornecedorHandler_GetByID_Success(t *testing.T) {
	f := sampleFornecedorResponse()
	uc := &mockFornecedorUseCase{
		getByIDFn: func(id uint) (*dto.FornecedorResponse, error) { return &f, nil },
	}
	h := NewFornecedorHandler(uc)

	req := httptest.NewRequest(http.MethodGet, "/fornecedores/1", nil)
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.GetByID(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status esperado %d, obteve %d", http.StatusOK, w.Code)
	}
	var result dto.FornecedorResponse
	decodeFornecedorBody(t, w.Body, &result)
	if result.ID != f.ID {
		t.Errorf("ID esperado %d, obteve %d", f.ID, result.ID)
	}
}

func TestFornecedorHandler_GetByID_InvalidID(t *testing.T) {
	h := NewFornecedorHandler(&mockFornecedorUseCase{})

	req := httptest.NewRequest(http.MethodGet, "/fornecedores/abc", nil)
	req.SetPathValue("id", "abc")
	w := httptest.NewRecorder()
	h.GetByID(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status esperado %d, obteve %d", http.StatusBadRequest, w.Code)
	}
}

func TestFornecedorHandler_GetByID_NotFound(t *testing.T) {
	uc := &mockFornecedorUseCase{
		getByIDFn: func(id uint) (*dto.FornecedorResponse, error) { return nil, gorm.ErrRecordNotFound },
	}
	h := NewFornecedorHandler(uc)

	req := httptest.NewRequest(http.MethodGet, "/fornecedores/99", nil)
	req.SetPathValue("id", "99")
	w := httptest.NewRecorder()
	h.GetByID(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status esperado %d, obteve %d", http.StatusNotFound, w.Code)
	}
}

func TestFornecedorHandler_GetByID_Error(t *testing.T) {
	uc := &mockFornecedorUseCase{
		getByIDFn: func(id uint) (*dto.FornecedorResponse, error) { return nil, errors.New("db error") },
	}
	h := NewFornecedorHandler(uc)

	req := httptest.NewRequest(http.MethodGet, "/fornecedores/1", nil)
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.GetByID(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status esperado %d, obteve %d", http.StatusInternalServerError, w.Code)
	}
}

// ── Create ────────────────────────────────────────────────────────────────────

func TestFornecedorHandler_Create_Success(t *testing.T) {
	f := sampleFornecedorResponse()
	uc := &mockFornecedorUseCase{
		createFn: func(req *dto.CreateFornecedorRequest) (*dto.FornecedorResponse, error) { return &f, nil },
	}
	h := NewFornecedorHandler(uc)

	body := dto.CreateFornecedorRequest{
		Nome:       "Fornecedor Ltda",
		Email:      "fornecedor@example.com",
		TipoPessoa: "JURIDICA",
		Documento:  "12345678000195",
		Status:     "ATIVO",
		UsuarioID:  1,
	}
	w := httptest.NewRecorder()
	h.Create(w, newFornecedorRequest(http.MethodPost, "/fornecedores", body))

	if w.Code != http.StatusCreated {
		t.Errorf("status esperado %d, obteve %d", http.StatusCreated, w.Code)
	}
	var result dto.FornecedorResponse
	decodeFornecedorBody(t, w.Body, &result)
	if result.Nome != f.Nome {
		t.Errorf("nome esperado %q, obteve %q", f.Nome, result.Nome)
	}
}

func TestFornecedorHandler_Create_InvalidBody(t *testing.T) {
	h := NewFornecedorHandler(&mockFornecedorUseCase{})

	req := httptest.NewRequest(http.MethodPost, "/fornecedores", bytes.NewBufferString("not json"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	h.Create(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status esperado %d, obteve %d", http.StatusBadRequest, w.Code)
	}
}

func TestFornecedorHandler_Create_ValidationError(t *testing.T) {
	h := NewFornecedorHandler(&mockFornecedorUseCase{})

	// Email inválido e campos obrigatórios ausentes
	body := map[string]any{
		"nome":  "Fornecedor",
		"email": "nao-e-email",
	}
	w := httptest.NewRecorder()
	h.Create(w, newFornecedorRequest(http.MethodPost, "/fornecedores", body))

	if w.Code != http.StatusUnprocessableEntity {
		t.Errorf("status esperado %d, obteve %d", http.StatusUnprocessableEntity, w.Code)
	}
}

func TestFornecedorHandler_Create_UseCaseError(t *testing.T) {
	uc := &mockFornecedorUseCase{
		createFn: func(req *dto.CreateFornecedorRequest) (*dto.FornecedorResponse, error) {
			return nil, errors.New("db error")
		},
	}
	h := NewFornecedorHandler(uc)

	body := dto.CreateFornecedorRequest{
		Nome:       "Fornecedor Ltda",
		Email:      "fornecedor@example.com",
		TipoPessoa: "JURIDICA",
		Documento:  "12345678000195",
		UsuarioID:  1,
	}
	w := httptest.NewRecorder()
	h.Create(w, newFornecedorRequest(http.MethodPost, "/fornecedores", body))

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status esperado %d, obteve %d", http.StatusInternalServerError, w.Code)
	}
}

// ── Update ────────────────────────────────────────────────────────────────────

func TestFornecedorHandler_Update_Success(t *testing.T) {
	f := sampleFornecedorResponse()
	f.Nome = "Fornecedor Atualizado"
	uc := &mockFornecedorUseCase{
		updateFn: func(id uint, req *dto.UpdateFornecedorRequest) (*dto.FornecedorResponse, error) { return &f, nil },
	}
	h := NewFornecedorHandler(uc)

	body := dto.UpdateFornecedorRequest{
		Nome:       "Fornecedor Atualizado",
		Email:      "fornecedor@example.com",
		TipoPessoa: "JURIDICA",
		Documento:  "12345678000195",
		UsuarioID:  1,
	}
	var buf bytes.Buffer
	json.NewEncoder(&buf).Encode(body)
	req := httptest.NewRequest(http.MethodPut, "/fornecedores/1", &buf)
	req.Header.Set("Content-Type", "application/json")
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.Update(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status esperado %d, obteve %d", http.StatusOK, w.Code)
	}
	var result dto.FornecedorResponse
	decodeFornecedorBody(t, w.Body, &result)
	if result.Nome != f.Nome {
		t.Errorf("nome esperado %q, obteve %q", f.Nome, result.Nome)
	}
}

func TestFornecedorHandler_Update_InvalidID(t *testing.T) {
	h := NewFornecedorHandler(&mockFornecedorUseCase{})

	req := httptest.NewRequest(http.MethodPut, "/fornecedores/abc", nil)
	req.SetPathValue("id", "abc")
	w := httptest.NewRecorder()
	h.Update(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status esperado %d, obteve %d", http.StatusBadRequest, w.Code)
	}
}

func TestFornecedorHandler_Update_InvalidBody(t *testing.T) {
	h := NewFornecedorHandler(&mockFornecedorUseCase{})

	req := httptest.NewRequest(http.MethodPut, "/fornecedores/1", bytes.NewBufferString("not json"))
	req.Header.Set("Content-Type", "application/json")
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.Update(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status esperado %d, obteve %d", http.StatusBadRequest, w.Code)
	}
}

func TestFornecedorHandler_Update_ValidationError(t *testing.T) {
	h := NewFornecedorHandler(&mockFornecedorUseCase{})

	body := map[string]any{
		"nome":  "Fornecedor",
		"email": "nao-e-email",
	}
	var buf bytes.Buffer
	json.NewEncoder(&buf).Encode(body)
	req := httptest.NewRequest(http.MethodPut, "/fornecedores/1", &buf)
	req.Header.Set("Content-Type", "application/json")
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.Update(w, req)

	if w.Code != http.StatusUnprocessableEntity {
		t.Errorf("status esperado %d, obteve %d", http.StatusUnprocessableEntity, w.Code)
	}
}

func TestFornecedorHandler_Update_NotFound(t *testing.T) {
	uc := &mockFornecedorUseCase{
		updateFn: func(id uint, req *dto.UpdateFornecedorRequest) (*dto.FornecedorResponse, error) {
			return nil, gorm.ErrRecordNotFound
		},
	}
	h := NewFornecedorHandler(uc)

	body := dto.UpdateFornecedorRequest{
		Nome:       "X",
		Email:      "x@example.com",
		TipoPessoa: "FISICA",
		Documento:  "12345678901",
		UsuarioID:  1,
	}
	var buf bytes.Buffer
	json.NewEncoder(&buf).Encode(body)
	req := httptest.NewRequest(http.MethodPut, "/fornecedores/99", &buf)
	req.Header.Set("Content-Type", "application/json")
	req.SetPathValue("id", "99")
	w := httptest.NewRecorder()
	h.Update(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status esperado %d, obteve %d", http.StatusNotFound, w.Code)
	}
}

func TestFornecedorHandler_Update_UseCaseError(t *testing.T) {
	uc := &mockFornecedorUseCase{
		updateFn: func(id uint, req *dto.UpdateFornecedorRequest) (*dto.FornecedorResponse, error) {
			return nil, errors.New("db error")
		},
	}
	h := NewFornecedorHandler(uc)

	body := dto.UpdateFornecedorRequest{
		Nome:       "Fornecedor Ltda",
		Email:      "fornecedor@example.com",
		TipoPessoa: "JURIDICA",
		Documento:  "12345678000195",
		UsuarioID:  1,
	}
	var buf bytes.Buffer
	json.NewEncoder(&buf).Encode(body)
	req := httptest.NewRequest(http.MethodPut, "/fornecedores/1", &buf)
	req.Header.Set("Content-Type", "application/json")
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.Update(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status esperado %d, obteve %d", http.StatusInternalServerError, w.Code)
	}
}

// ── Delete ────────────────────────────────────────────────────────────────────

func TestFornecedorHandler_Delete_Success(t *testing.T) {
	uc := &mockFornecedorUseCase{
		deleteFn: func(id uint) error { return nil },
	}
	h := NewFornecedorHandler(uc)

	req := httptest.NewRequest(http.MethodDelete, "/fornecedores/1", nil)
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.Delete(w, req)

	if w.Code != http.StatusNoContent {
		t.Errorf("status esperado %d, obteve %d", http.StatusNoContent, w.Code)
	}
}

func TestFornecedorHandler_Delete_InvalidID(t *testing.T) {
	h := NewFornecedorHandler(&mockFornecedorUseCase{})

	req := httptest.NewRequest(http.MethodDelete, "/fornecedores/abc", nil)
	req.SetPathValue("id", "abc")
	w := httptest.NewRecorder()
	h.Delete(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status esperado %d, obteve %d", http.StatusBadRequest, w.Code)
	}
}

func TestFornecedorHandler_Delete_NotFound(t *testing.T) {
	uc := &mockFornecedorUseCase{
		deleteFn: func(id uint) error { return gorm.ErrRecordNotFound },
	}
	h := NewFornecedorHandler(uc)

	req := httptest.NewRequest(http.MethodDelete, "/fornecedores/99", nil)
	req.SetPathValue("id", "99")
	w := httptest.NewRecorder()
	h.Delete(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status esperado %d, obteve %d", http.StatusNotFound, w.Code)
	}
}

func TestFornecedorHandler_Delete_Error(t *testing.T) {
	uc := &mockFornecedorUseCase{
		deleteFn: func(id uint) error { return errors.New("db error") },
	}
	h := NewFornecedorHandler(uc)

	req := httptest.NewRequest(http.MethodDelete, "/fornecedores/1", nil)
	req.SetPathValue("id", "1")
	w := httptest.NewRecorder()
	h.Delete(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status esperado %d, obteve %d", http.StatusInternalServerError, w.Code)
	}
}
