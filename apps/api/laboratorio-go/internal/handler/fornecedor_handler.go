package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/zorde/api/internal/dto"
	"github.com/zorde/api/internal/usecase"
	"gorm.io/gorm"
)

type FornecedorHandler struct {
	uc usecase.FornecedorUseCase
}

func NewFornecedorHandler(uc usecase.FornecedorUseCase) *FornecedorHandler {
	return &FornecedorHandler{uc: uc}
}

func (h *FornecedorHandler) List(w http.ResponseWriter, r *http.Request) {
	fornecedores, err := h.uc.GetAll()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	if fornecedores == nil {
		fornecedores = []dto.FornecedorResponse{}
	}
	writeJSON(w, http.StatusOK, fornecedores)
}

func (h *FornecedorHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id inválido")
		return
	}
	fornecedor, err := h.uc.GetByID(uint(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "fornecedor não encontrado")
			return
		}
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	writeJSON(w, http.StatusOK, fornecedor)
}

func (h *FornecedorHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateFornecedorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "body inválido")
		return
	}
	if err := validate.Struct(req); err != nil {
		writeValidationErrors(w, err)
		return
	}
	fornecedor, err := h.uc.Create(&req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	writeJSON(w, http.StatusCreated, fornecedor)
}

func (h *FornecedorHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id inválido")
		return
	}
	var req dto.UpdateFornecedorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "body inválido")
		return
	}
	if err := validate.Struct(req); err != nil {
		writeValidationErrors(w, err)
		return
	}
	fornecedor, err := h.uc.Update(uint(id), &req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "fornecedor não encontrado")
			return
		}
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	writeJSON(w, http.StatusOK, fornecedor)
}

func (h *FornecedorHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id inválido")
		return
	}
	if err := h.uc.Delete(uint(id)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "fornecedor não encontrado")
			return
		}
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
