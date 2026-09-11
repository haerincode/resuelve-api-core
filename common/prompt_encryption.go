package common

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"strings"
)

const (
	// PromptEncryptionVersion es la versión del formato de encriptación
	PromptEncryptionVersion = "v1"
	// PromptEncryptionPrefix es el prefijo que identifica prompts encriptados
	PromptEncryptionPrefix = "llm_encrypted_v1:"
)

// PromptEncryptor encripta y desencripta prompts para APIs de LLM
type PromptEncryptor struct {
	encryptionKey []byte
}

// NewPromptEncryptor crea un nuevo encriptador con una master key
// La key debe tener 32 bytes (AES-256)
func NewPromptEncryptor(masterKey string) (*PromptEncryptor, error) {
	if masterKey == "" {
		return nil, errors.New("prompt encryption key is required")
	}

	// Derivar key de 32 bytes desde masterKey usando SHA256
	hash := sha256.Sum256([]byte(masterKey))
	encryptionKey := hash[:]

	return &PromptEncryptor{
		encryptionKey: encryptionKey,
	}, nil
}

const (
	// MaxPromptSize es el tamaño máximo permitido de un prompt (1MB)
	MaxPromptSize = 1024 * 1024
)

// EncryptPrompt encripta un prompt y retorna string base64 con prefijo
func (pe *PromptEncryptor) EncryptPrompt(plaintext string) (string, error) {
	if plaintext == "" {
		return "", errors.New("prompt cannot be empty")
	}
	if len(plaintext) > MaxPromptSize {
		return "", fmt.Errorf("prompt exceeds maximum size of %d bytes", MaxPromptSize)
	}

	// Crear cipher block
	block, err := aes.NewCipher(pe.encryptionKey)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher: %w", err)
	}

	// Usar GCM mode para autenticación
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	// Generar nonce aleatorio (12 bytes para GCM)
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("failed to generate nonce: %w", err)
	}

	// Encriptar
	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)

	// Retornar como base64 con prefijo
	encoded := base64.StdEncoding.EncodeToString(ciphertext)
	return PromptEncryptionPrefix + encoded, nil
}

// DecryptPrompt desencripta un prompt encriptado
func (pe *PromptEncryptor) DecryptPrompt(encrypted string) (string, error) {
	if encrypted == "" {
		return "", errors.New("encrypted prompt cannot be empty")
	}

	// Verificar prefijo
	if !strings.HasPrefix(encrypted, PromptEncryptionPrefix) {
		return "", errors.New("not a valid encrypted prompt (missing prefix)")
	}

	// Remover prefijo
	encoded := strings.TrimPrefix(encrypted, PromptEncryptionPrefix)

	// Decodificar base64
	ciphertext, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		return "", fmt.Errorf("failed to decode base64: %w", err)
	}

	// Crear cipher block
	block, err := aes.NewCipher(pe.encryptionKey)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher: %w", err)
	}

	// Crear GCM
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	// Extraer nonce (primeros 12 bytes)
	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", errors.New("ciphertext too short")
	}

	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]

	// Desencriptar
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", fmt.Errorf("failed to decrypt: %w", err)
	}

	return string(plaintext), nil
}

// IsEncryptedPrompt verifica si un string es un prompt encriptado
func IsEncryptedPrompt(s string) bool {
	return strings.HasPrefix(s, PromptEncryptionPrefix)
}

// MustEncryptPrompt encripta un prompt o panic si falla
func (pe *PromptEncryptor) MustEncryptPrompt(plaintext string) string {
	encrypted, err := pe.EncryptPrompt(plaintext)
	if err != nil {
		panic(fmt.Sprintf("failed to encrypt prompt: %v", err))
	}
	return encrypted
}

// MustDecryptPrompt desencripta un prompt o panic si falla
func (pe *PromptEncryptor) MustDecryptPrompt(encrypted string) string {
	plaintext, err := pe.DecryptPrompt(encrypted)
	if err != nil {
		panic(fmt.Sprintf("failed to decrypt prompt: %v", err))
	}
	return plaintext
}
