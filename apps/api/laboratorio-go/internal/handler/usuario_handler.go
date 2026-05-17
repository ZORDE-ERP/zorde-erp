package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/zorde/api/internal/dto"
	"github.com/zorde/api/internal/usecase"
)

type UsuarioHandler struct {
	uc usecase.UsuarioUseCase
}

func NewUsuarioHandler(uc usecase.UsuarioUseCase) *UsuarioHandler {
	return &UsuarioHandler{uc: uc}
}

func (h *UsuarioHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input dto.CreateUsuarioInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "body inválido")
		return
	}
	if err := validate.Struct(input); err != nil {
		writeValidationErrors(w, err)
		return
	}
	resp, err := h.uc.CreateUsuario(&input)
	if err != nil {
		var ucErr *usecase.UseCaseError
		if errors.As(err, &ucErr) {
			writeError(w, ucErr.Code, ucErr.Message)
			return
		}
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	writeJSON(w, http.StatusCreated, resp)
}

func (h *UsuarioHandler) List(w http.ResponseWriter, r *http.Request) {
	usuarios, err := h.uc.ListUsuarios()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	if usuarios == nil {
		usuarios = []dto.UsuarioResponse{}
	}
	writeJSON(w, http.StatusOK, usuarios)
}

func (h *UsuarioHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id inválido")
		return
	}
	var input dto.UpdateUsuarioInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "body inválido")
		return
	}
	if err := validate.Struct(input); err != nil {
		writeValidationErrors(w, err)
		return
	}
	resp, err := h.uc.UpdateUsuario(uint(id), &input)
	if err != nil {
		var ucErr *usecase.UseCaseError
		if errors.As(err, &ucErr) {
			writeError(w, ucErr.Code, ucErr.Message)
			return
		}
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	writeJSON(w, http.StatusOK, resp)
}

func (h *UsuarioHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id inválido")
		return
	}
	if err := h.uc.DeleteUsuario(uint(id)); err != nil {
		var ucErr *usecase.UseCaseError
		if errors.As(err, &ucErr) {
			writeError(w, ucErr.Code, ucErr.Message)
			return
		}
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
