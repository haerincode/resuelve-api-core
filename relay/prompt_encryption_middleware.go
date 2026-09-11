package relay

import (
	"encoding/json"
	"fmt"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
)

// PromptEncryptionMiddleware intercepts and encrypts prompts before sending to LLM providers
// Only encrypts if PROMPT_ENCRYPTION_KEY is set and request is marked for encryption
type PromptEncryptionMiddleware struct {
	encryptor *common.PromptEncryptor
	enabled   bool
}

// NewPromptEncryptionMiddleware creates a new prompt encryption middleware
func NewPromptEncryptionMiddleware() *PromptEncryptionMiddleware {
	encryptionKey := common.GetEnvOrDefaultString("PROMPT_ENCRYPTION_KEY", "")
	if encryptionKey == "" {
		return &PromptEncryptionMiddleware{enabled: false}
	}

	encryptor, err := common.NewPromptEncryptor(encryptionKey)
	if err != nil {
		common.SysError(fmt.Sprintf("failed to initialize prompt encryption: %v", err))
		return &PromptEncryptionMiddleware{enabled: false}
	}

	return &PromptEncryptionMiddleware{
		encryptor: encryptor,
		enabled:   true,
	}
}

// EncryptPromptsInRequest encripta todos los prompts en una request
// Modifica el payload en-place para encriptar campos relevantes
// IMPORTANTE: Si PROMPT_ENCRYPTION_KEY está configurado, SIEMPRE encripta (no es opcional)
func (pem *PromptEncryptionMiddleware) EncryptPromptsInRequest(c *gin.Context, payload interface{}) error {
	if !pem.enabled {
		return nil
	}

	// Si la encriptación está habilitada (key configurada), SIEMPRE encriptar
	// No permitir bypass con header/parámetro

	// Convertir payload a map para manipulación dinámica
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	var payloadMap map[string]interface{}
	if err := json.Unmarshal(data, &payloadMap); err != nil {
		return err
	}

	// Encriptar campos de mensajes
	if messages, ok := payloadMap["messages"].([]interface{}); ok {
		for _, msg := range messages {
			if msgMap, ok := msg.(map[string]interface{}); ok {
				// Encriptar contenido de usuario
				if content, ok := msgMap["content"].(string); ok && content != "" {
					encrypted, err := pem.encryptor.EncryptPrompt(content)
					if err != nil {
						// CRÍTICO: No continuar silenciosamente si falla encriptación
						return fmt.Errorf("encryption failed for message content: %w", err)
					}
					msgMap["content"] = encrypted
				}
			}
		}
	}

	// Encriptar system prompt si existe
	if system, ok := payloadMap["system"].(string); ok && system != "" {
		encrypted, err := pem.encryptor.EncryptPrompt(system)
		if err != nil {
			// CRÍTICO: Fallar si la encriptación del system prompt falla
			return fmt.Errorf("encryption failed for system prompt: %w", err)
		}
		payloadMap["system"] = encrypted
	}

	// Re-serializar
	encrypted, err := json.Marshal(payloadMap)
	if err != nil {
		return err
	}

	// Copiar de vuelta al payload original
	return json.Unmarshal(encrypted, payload)
}

// DecryptPromptsInResponse desencripta los prompts en una respuesta
// CRÍTICO: Falla si hay ciphertext que no puede ser desencriptado
func (pem *PromptEncryptionMiddleware) DecryptPromptsInResponse(response interface{}) error {
	if !pem.enabled {
		return nil
	}

	data, err := json.Marshal(response)
	if err != nil {
		return err
	}

	var responseMap map[string]interface{}
	if err := json.Unmarshal(data, &responseMap); err != nil {
		return err
	}

	// Desencriptar choices si existen
	if choices, ok := responseMap["choices"].([]interface{}); ok {
		for _, choice := range choices {
			if choiceMap, ok := choice.(map[string]interface{}); ok {
				if message, ok := choiceMap["message"].(map[string]interface{}); ok {
					if content, ok := message["content"].(string); ok && content != "" {
						// Si el content es encriptado, DEBE desencriptarse exitosamente
						if common.IsEncryptedPrompt(content) {
							decrypted, err := pem.encryptor.DecryptPrompt(content)
							if err != nil {
								// CRÍTICO: No devolver ciphertext sin desencriptar
								return fmt.Errorf("decryption failed for response content: %w", err)
							}
							message["content"] = decrypted
						}
					}
				}
			}
		}
	}

	// Re-serializar
	decrypted, err := json.Marshal(responseMap)
	if err != nil {
		return err
	}

	return json.Unmarshal(decrypted, response)
}

// IsPromptEncryptionEnabled retorna si la encriptación de prompts está habilitada
func (pem *PromptEncryptionMiddleware) IsPromptEncryptionEnabled() bool {
	return pem.enabled
}
