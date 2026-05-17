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

type TabelaMontagemHandler struct {
	uc usecase.TabelaMontagemUseCase
}

func NewTabelaMontagemHandler(uc usecase.TabelaMontagemUseCase) *TabelaMontagemHandler {
	return &TabelaMontagemHandler{uc: uc}
}

func (h *TabelaMontagemHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	search := r.URL.Query().Get("search")

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	result, err := h.uc.GetAll(page, limit, search)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *TabelaMontagemHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateTabelaMontagemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "body inválido")
		return
	}
	if err := validate.Struct(req); err != nil {
		writeValidationErrors(w, err)
		return
	}
	tabela, err := h.uc.Create(&req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, tabela)
}

func (h *TabelaMontagemHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id inválido")
		return
	}
	var req dto.UpdateTabelaMontagemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "body inválido")
		return
	}
	if err := validate.Struct(req); err != nil {
		writeValidationErrors(w, err)
		return
	}
	tabela, err := h.uc.Update(uint(id), &req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "registro não encontrado")
			return
		}
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, tabela)
}

func (h *TabelaMontagemHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id inválido")
		return
	}
	if err := h.uc.Delete(uint(id)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "registro não encontrado")
			return
		}
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	writeJSON(w, http.StatusOK, messageResponse{Message: "registro excluído com sucesso"})
}
