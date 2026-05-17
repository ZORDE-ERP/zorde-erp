package security

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"fmt"
	"strings"

	"golang.org/x/crypto/argon2"
)

// PasswordHasher define o contrato para hashing e verificação de senhas.
type PasswordHasher interface {
	Hash(senha string) (string, error)
	Verify(senha, encodedHash string) (bool, error)
}

const (
	argon2Time    uint32 = 3
	argon2Memory  uint32 = 64 * 1024 // 64 MB
	argon2Threads uint8  = 4
	argon2KeyLen  uint32 = 32
	argon2SaltLen        = 16
)

type argon2Hasher struct{}

// NewArgon2Hasher retorna uma implementação de PasswordHasher usando argon2id.
func NewArgon2Hasher() PasswordHasher {
	return &argon2Hasher{}
}

func (h *argon2Hasher) Hash(senha string) (string, error) {
	salt := make([]byte, argon2SaltLen)
	if _, err := rand.Read(salt); err != nil {
		return "", fmt.Errorf("security: falha ao gerar salt: %w", err)
	}
	hash := argon2.IDKey([]byte(senha), salt, argon2Time, argon2Memory, argon2Threads, argon2KeyLen)
	return fmt.Sprintf("$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s",
		argon2.Version, argon2Memory, argon2Time, argon2Threads,
		base64.RawStdEncoding.EncodeToString(salt),
		base64.RawStdEncoding.EncodeToString(hash),
	), nil
}

func (h *argon2Hasher) Verify(senha, encodedHash string) (bool, error) {
	parts := strings.Split(encodedHash, "$")
	// formato: $argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>
	if len(parts) != 6 {
		return false, fmt.Errorf("security: formato de hash inválido")
	}
	var version int
	if _, err := fmt.Sscanf(parts[2], "v=%d", &version); err != nil {
		return false, fmt.Errorf("security: versão inválida no hash: %w", err)
	}
	var memory, timeCost uint32
	var threads uint8
	if _, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &timeCost, &threads); err != nil {
		return false, fmt.Errorf("security: parâmetros inválidos no hash: %w", err)
	}
	salt, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return false, fmt.Errorf("security: salt inválido: %w", err)
	}
	hashBytes, err := base64.RawStdEncoding.DecodeString(parts[5])
	if err != nil {
		return false, fmt.Errorf("security: hash inválido: %w", err)
	}
	computed := argon2.IDKey([]byte(senha), salt, timeCost, memory, threads, uint32(len(hashBytes)))
	return subtle.ConstantTimeCompare(computed, hashBytes) == 1, nil
}
