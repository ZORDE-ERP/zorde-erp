package security

import (
	"os"
	"testing"
)

func TestGenerateAndValidateTokens(t *testing.T) {
	os.Setenv("JWT_SECRET", "test_secret")

	userID := uint(1)
	nome := "John Doe"
	email := "john@example.com"
	fingerprint := "abc123hash"

	accessToken, refreshToken, err := GenerateTokens(userID, nome, email, fingerprint)
	if err != nil {
		t.Fatalf("Failed to generate tokens: %v", err)
	}

	if accessToken == "" || refreshToken == "" {
		t.Errorf("Expected tokens to not be empty")
	}

	claims, err := ValidateToken(accessToken)
	if err != nil {
		t.Fatalf("Failed to validate token: %v", err)
	}

	if claims.Sub != "1" {
		t.Errorf("Expected sub to be '1', got %s", claims.Sub)
	}
	if claims.Nome != nome {
		t.Errorf("Expected nome to be '%s', got %s", nome, claims.Nome)
	}
	if claims.Fingerprint != fingerprint {
		t.Errorf("Expected fingerprint to be '%s', got %s", fingerprint, claims.Fingerprint)
	}
}
