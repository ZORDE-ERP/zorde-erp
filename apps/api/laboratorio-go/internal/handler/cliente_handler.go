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

type ClienteHandler struct {
	uc usecase.ClienteUseCase
}

func NewClienteHandler(uc usecase.ClienteUseCase) *ClienteHandler {
	return &ClienteHandler{uc: uc}
}

func (h *ClienteHandler) List(w http.ResponseWriter, r *http.Request) {
	clientes, err := h.uc.GetAll()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	if clientes == nil {
		clientes = []dto.ClienteResponse{}
	}
	writeJSON(w, http.StatusOK, clientes)
}

func (h *ClienteHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id inválido")
		return
	}
	cliente, err := h.uc.GetByID(uint(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "cliente não encontrado")
			return
		}
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	writeJSON(w, http.StatusOK, cliente)
}

func (h *ClienteHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateClienteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "body inválido")
		return
	}
	if err := validate.Struct(req); err != nil {
		writeValidationErrors(w, err)
		return
	}
	cliente, err := h.uc.Create(&req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	writeJSON(w, http.StatusCreated, cliente)
}

func (h *ClienteHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id inválido")
		return
	}
	var req dto.UpdateClienteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "body inválido")
		return
	}
	if err := validate.Struct(req); err != nil {
		writeValidationErrors(w, err)
		return
	}
	cliente, err := h.uc.Update(uint(id), &req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "cliente não encontrado")
			return
		}
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	writeJSON(w, http.StatusOK, cliente)
}

func (h *ClienteHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id inválido")
		return
	}
	if err := h.uc.Delete(uint(id)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "cliente não encontrado")
			return
		}
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
