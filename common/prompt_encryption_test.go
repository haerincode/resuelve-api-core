package common

import (
	"testing"
)

func TestPromptEncryption(t *testing.T) {
	masterKey := "my-super-secret-master-key-for-prompts"
	encryptor, err := NewPromptEncryptor(masterKey)
	if err != nil {
		t.Fatalf("failed to create encryptor: %v", err)
	}

	testCases := []string{
		"Hello, how are you?",
		"What is 2+2?",
		"Tell me a joke",
		"Translate this to Spanish: Hello world",
		"", // Empty should fail
		"Very long prompt that contains multiple sentences. This is a test to ensure that longer prompts are properly encrypted and decrypted without any issues.",
	}

	for _, plaintext := range testCases {
		if plaintext == "" {
			// Test empty prompt fails
			encrypted, err := encryptor.EncryptPrompt(plaintext)
			if err == nil {
				t.Errorf("expected error for empty prompt, got encrypted: %s", encrypted)
			}
			continue
		}

		// Encriptar
		encrypted, err := encryptor.EncryptPrompt(plaintext)
		if err != nil {
			t.Fatalf("failed to encrypt: %v", err)
		}

		// Verificar que tiene el prefijo
		if !IsEncryptedPrompt(encrypted) {
			t.Errorf("encrypted prompt missing prefix: %s", encrypted)
		}

		// Verificar que es diferente cada vez (por el nonce aleatorio)
		encrypted2, err := encryptor.EncryptPrompt(plaintext)
		if err != nil {
			t.Fatalf("failed to encrypt again: %v", err)
		}

		if encrypted == encrypted2 {
			t.Errorf("encryption should produce different ciphertext due to random nonce")
		}

		// Desencriptar
		decrypted, err := encryptor.DecryptPrompt(encrypted)
		if err != nil {
			t.Fatalf("failed to decrypt: %v", err)
		}

		if decrypted != plaintext {
			t.Errorf("decrypted text doesn't match original\nExpected: %s\nGot: %s", plaintext, decrypted)
		}
	}
}

func TestPromptEncryptionWithDifferentKeys(t *testing.T) {
	plaintext := "Secret message"

	// Encriptar con key 1
	encryptor1, _ := NewPromptEncryptor("key-1")
	encrypted, _ := encryptor1.EncryptPrompt(plaintext)

	// Intentar desencriptar con key 2
	encryptor2, _ := NewPromptEncryptor("key-2")
	_, err := encryptor2.DecryptPrompt(encrypted)

	if err == nil {
		t.Errorf("should fail to decrypt with different key")
	}
}

func TestIsEncryptedPrompt(t *testing.T) {
	testCases := []struct {
		input    string
		expected bool
	}{
		{"llm_encrypted_v1:abc123", true},
		{"hello world", false},
		{"", false},
		{"v1:something", false},
	}

	for _, tc := range testCases {
		result := IsEncryptedPrompt(tc.input)
		if result != tc.expected {
			t.Errorf("IsEncryptedPrompt(%q) = %v, expected %v", tc.input, result, tc.expected)
		}
	}
}
