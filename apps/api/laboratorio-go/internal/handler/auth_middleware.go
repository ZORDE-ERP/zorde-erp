package handler

import (
	"context"
	"net"
	"net/http"
	"os"
	"strings"

	"github.com/zorde/api/internal/security"
)

// extractIP returns only the IP part of remoteAddr (strips the port).
func extractIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		return strings.SplitN(xff, ",", 2)[0]
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

type contextKey string

const UserContextKey contextKey = "user"

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "missing authorization header", http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "invalid authorization header format", http.StatusUnauthorized)
			return
		}

		tokenString := parts[1]
		claims, err := security.ValidateToken(tokenString)
		if err != nil {
			http.Error(w, "invalid or expired token", http.StatusUnauthorized)
			return
		}

		cookieName := "Fgp"
		if os.Getenv("APP_ENV") == "production" {
			cookieName = "__Secure-Fgp"
		}
		cookie, err := r.Cookie(cookieName)
		if err != nil {
			http.Error(w, "missing fingerprint cookie", http.StatusUnauthorized)
			return
		}

		ip := extractIP(r)
		userAgent := r.UserAgent()
		expectedFingerprint := security.GenerateFingerprintHash(ip, userAgent)

		if cookie.Value != expectedFingerprint || claims.Fingerprint != expectedFingerprint {
			http.Error(w, "fingerprint mismatch", http.StatusUnauthorized)
			return
		}

		// Inject user claims into context
		ctx := context.WithValue(r.Context(), UserContextKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}
