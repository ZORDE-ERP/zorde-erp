package handler

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/zorde/api/internal/dto"
	"github.com/zorde/api/internal/security"
	"github.com/zorde/api/internal/usecase"
)

type AutenticacaoHandler struct {
	authUC usecase.AutenticacaoUseCase
}

func NewAutenticacaoHandler(authUC usecase.AutenticacaoUseCase) *AutenticacaoHandler {
	return &AutenticacaoHandler{authUC: authUC}
}

func fingerprintCookieName() string {
	if os.Getenv("APP_ENV") == "production" {
		return "__Secure-Fgp"
	}
	return "Fgp"
}

func (h *AutenticacaoHandler) setFingerprintCookie(w http.ResponseWriter, fingerprint string) {
	isProd := os.Getenv("APP_ENV") == "production"
	http.SetCookie(w, &http.Cookie{
		Name:     fingerprintCookieName(),
		Value:    fingerprint,
		Path:     "/",
		HttpOnly: true,
		Secure:   isProd,
		SameSite: http.SameSiteStrictMode,
	})
}

func (h *AutenticacaoHandler) clearFingerprintCookie(w http.ResponseWriter) {
	isProd := os.Getenv("APP_ENV") == "production"
	http.SetCookie(w, &http.Cookie{
		Name:     fingerprintCookieName(),
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   isProd,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   -1,
	})
}

func (h *AutenticacaoHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input dto.LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	ip := extractIP(r)
	userAgent := r.UserAgent()

	output, refreshToken, err := h.authUC.Login(r.Context(), input, ip, userAgent)
	if err != nil {
		if err == usecase.ErrInvalidCredentials {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	fingerprint := security.GenerateFingerprintHash(ip, userAgent)
	h.setFingerprintCookie(w, fingerprint)

	// In the real system, you might want to return the refresh token as well, or set it in another cookie.
	// But the design says: "O refresh token será armazenado na tabela autenticacao e enviado no body da resposta do login. O frontend o armazenará no localStorage junto ao access_token."
	response := map[string]string{
		"access_token":  output.AccessToken,
		"refresh_token": refreshToken,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *AutenticacaoHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	var input dto.RefreshInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	ip := extractIP(r)
	userAgent := r.UserAgent()

	output, newRefreshToken, err := h.authUC.Refresh(r.Context(), input, ip, userAgent)
	if err != nil {
		if err == usecase.ErrInvalidToken {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	fingerprint := security.GenerateFingerprintHash(ip, userAgent)
	h.setFingerprintCookie(w, fingerprint)

	response := map[string]string{
		"access_token":  output.AccessToken,
		"refresh_token": newRefreshToken,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *AutenticacaoHandler) Logout(w http.ResponseWriter, r *http.Request) {
	var input struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err == nil {
		h.authUC.Logout(r.Context(), input.RefreshToken)
	}

	h.clearFingerprintCookie(w)
	w.WriteHeader(http.StatusNoContent)
}
