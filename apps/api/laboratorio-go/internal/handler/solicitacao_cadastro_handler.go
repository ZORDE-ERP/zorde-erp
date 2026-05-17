package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/zorde/api/internal/dto"
	"github.com/zorde/api/internal/usecase"
)

type SolicitacaoCadastroHandler struct {
	uc usecase.SolicitacaoCadastroUseCase
}

func NewSolicitacaoCadastroHandler(uc usecase.SolicitacaoCadastroUseCase) *SolicitacaoCadastroHandler {
	return &SolicitacaoCadastroHandler{uc: uc}
}

func (h *SolicitacaoCadastroHandler) SolicitarCadastro(w http.ResponseWriter, r *http.Request) {
	var input dto.SolicitarCadastroInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "body inválido")
		return
	}
	if err := validate.Struct(input); err != nil {
		writeValidationErrors(w, err)
		return
	}
	if err := h.uc.SolicitarCadastro(&input); err != nil {
		var ucErr *usecase.UseCaseError
		if errors.As(err, &ucErr) {
			writeError(w, ucErr.Code, ucErr.Message)
			return
		}
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	writeJSON(w, http.StatusOK, messageResponse{Message: "Código enviado. Verifique sua caixa de entrada ou a caixa de spam."})
}

func (h *SolicitacaoCadastroHandler) VerificarEmail(w http.ResponseWriter, r *http.Request) {
	var input dto.VerificarEmailInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "body inválido")
		return
	}
	if err := validate.Struct(input); err != nil {
		writeValidationErrors(w, err)
		return
	}
	if err := h.uc.VerificarEmail(&input); err != nil {
		var ucErr *usecase.UseCaseError
		if errors.As(err, &ucErr) {
			writeError(w, ucErr.Code, ucErr.Message)
			return
		}
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	writeJSON(w, http.StatusOK, messageResponse{Message: "Código confirmado com sucesso."})
}

func (h *SolicitacaoCadastroHandler) ReenviarCodigo(w http.ResponseWriter, r *http.Request) {
	var input dto.ReenviarCodigoInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "body inválido")
		return
	}
	if err := validate.Struct(input); err != nil {
		writeValidationErrors(w, err)
		return
	}
	if err := h.uc.ReenviarCodigo(&input); err != nil {
		var ucErr *usecase.UseCaseError
		if errors.As(err, &ucErr) {
			writeError(w, ucErr.Code, ucErr.Message)
			return
		}
		writeError(w, http.StatusInternalServerError, "erro interno")
		return
	}
	w.WriteHeader(http.StatusOK)
}
