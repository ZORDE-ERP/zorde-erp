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

type OrdemDeServicoHandler struct {
	uc usecase.OrdemDeServicoUseCase
}

func NewOrdemDeServicoHandler(uc usecase.OrdemDeServicoUseCase) *OrdemDeServicoHandler {
	return &OrdemDeServicoHandler{uc: uc}
}

func (h *OrdemDeServicoHandler) List(w http.ResponseWriter, r *http.Request) {
	ordens, err := h.uc.GetAll()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	if ordens == nil {
		ordens = []dto.OrdemDeServicoResponse{}
	}
	writeJSON(w, http.StatusOK, ordens)
}

func (h *OrdemDeServicoHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id inválido")
		return
	}
	ordem, err := h.uc.GetByID(uint(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "ordem de serviço não encontrada")
			return
		}
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	writeJSON(w, http.StatusOK, ordem)
}

func (h *OrdemDeServicoHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateOrdemDeServicoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "body inválido")
		return
	}
	if err := validate.Struct(req); err != nil {
		writeValidationErrors(w, err)
		return
	}
	ordem, err := h.uc.Create(&req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusUnprocessableEntity, err.Error())
			return
		}
		// relation not found errors (custom fmt.Errorf)
		writeError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, ordem)
}

func (h *OrdemDeServicoHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id inválido")
		return
	}
	var req dto.UpdateOrdemDeServicoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "body inválido")
		return
	}
	if err := validate.Struct(req); err != nil {
		writeValidationErrors(w, err)
		return
	}
	ordem, err := h.uc.Update(uint(id), &req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "ordem de serviço não encontrada")
			return
		}
		writeError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, ordem)
}

func (h *OrdemDeServicoHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id inválido")
		return
	}
	if err := h.uc.Delete(uint(id)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "ordem de serviço não encontrada")
			return
		}
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
