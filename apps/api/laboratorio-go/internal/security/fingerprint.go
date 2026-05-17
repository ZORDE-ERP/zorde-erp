package security

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

// GenerateFingerprintHash generates a SHA-256 hash from IP and User-Agent
func GenerateFingerprintHash(ip, userAgent string) string {
	data := fmt.Sprintf("%s|%s", ip, userAgent)
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}
