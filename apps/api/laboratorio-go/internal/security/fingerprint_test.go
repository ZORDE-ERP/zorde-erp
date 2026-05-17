package security

import (
	"testing"
)

func TestGenerateFingerprintHash(t *testing.T) {
	ip := "192.168.1.1"
	userAgent := "Mozilla/5.0"

	hash1 := GenerateFingerprintHash(ip, userAgent)
	hash2 := GenerateFingerprintHash(ip, userAgent)

	if hash1 != hash2 {
		t.Errorf("Expected identical hashes for identical input, got %s and %s", hash1, hash2)
	}

	hash3 := GenerateFingerprintHash("10.0.0.1", userAgent)
	if hash1 == hash3 {
		t.Errorf("Expected different hashes for different IP, got %s", hash1)
	}
}
