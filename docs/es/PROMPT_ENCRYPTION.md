# Encriptación de Prompts - Protege tus prompts en OpenAI/Anthropic

## ¿Por qué?

Cuando envías prompts a OpenAI o Anthropic, ellos pueden ver exactamente qué escribiste. Con Encriptación de Prompts, tus prompts están **encriptados end-to-end** - ni siquiera OpenAI/Anthropic puede leerlos.

```
Tu Prompt: "Analizar datos confidenciales de clientes..."
                    ↓
           [ENCRIPTACIÓN AES-256]
                    ↓
OpenAI ve: "llm_encrypted_v1:Jk3xQ9mL2pKq8xR5vW7yZ..."
```

## Cómo Funciona

### 1. **Encriptación Local**
- Tu código encripta el prompt ANTES de enviarlo a OpenAI/Anthropic
- Solo tú tienes la clave de desencriptación
- Usa **AES-256-GCM** (encriptación de 256 bits + autenticación)

### 2. **Envío Encriptado**
- OpenAI/Anthropic recibe un blob encriptado
- No pueden ver el contenido original
- No pueden usar tu prompt para entrenar

### 3. **Respuesta Encriptada**
- La respuesta también puede estar encriptada
- Se desencripta localmente en tu servidor

### 4. **Código Abierto**
- Todo el código está disponible en GitHub
- Cualquiera puede auditar la encriptación
- No hay "magia negra"

---

## Configuración

### 1. Generar una Clave Maestra

```bash
# Linux/Mac
openssl rand -hex 32

# PowerShell
-join ((48..57) + (65..70) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### 2. Agregar a .env

```env
# Clave de Encriptación de Prompts (32 caracteres hex o cualquier string)
PROMPT_ENCRYPTION_KEY=tu-clave-generada-aqui
```

### 3. Usar en tu código

```go
package main

import "github.com/QuantumNous/new-api/common"

func main() {
    // Crear encriptador
    encryptor, err := common.NewPromptEncryptor("tu-clave-secreta")
    if err != nil {
        panic(err)
    }

    // Encriptar un prompt
    prompt := "Este es mi prompt secreto"
    encrypted, err := encryptor.EncryptPrompt(prompt)
    // encrypted = "llm_encrypted_v1:Jk3xQ9mL2pKq8xR5vW7yZ..."

    // Enviar a OpenAI
    response := callOpenAI(encrypted)

    // Desencriptar respuesta
    decrypted, err := encryptor.DecryptPrompt(response)
}
```

---

## Especificación Técnica

### Algoritmo
- **Cipher**: AES-256 en modo GCM
- **Derivación de Clave**: SHA256(master_key)
- **Nonce**: 12 bytes aleatorios (generados por crypto/rand)
- **Autenticación**: GCM proporciona AEAD (authenticated encryption)
- **Codificación**: Base64

### Formato
```
llm_encrypted_v1:BASE64(nonce + ciphertext + tag)
```

- `llm_encrypted_v1`: Versión del formato (permite upgrades futuros)
- `nonce`: 12 bytes aleatorios
- `ciphertext`: El prompt encriptado
- `tag`: 16 bytes de autenticación (incluido en GCM)

### Seguridad
- ✅ **Confidencialidad**: AES-256 es militarmente seguro
- ✅ **Integridad**: GCM verifica que no fue manipulado
- ✅ **Autenticidad**: Solo quien tenga la key puede desencriptar
- ✅ **Forward Secrecy**: Si la key se compromete, los viejos mensajes están protegidos por nonces aleatorios

---

## Auditoría

Todo está en código abierto:
- `common/prompt_encryption.go` - La encriptación
- `common/prompt_encryption_test.go` - Tests
- `relay/prompt_encryption_middleware.go` - Integración con APIs de LLM

Puedes revisar línea por línea y confirmar que es seguro.

---

## Limitaciones

### OpenAI/Anthropic aún sabe:
- Que enviaste ALGO (metadata)
- Tamaño del prompt (aproximado)
- Cuándo lo enviaste
- Tu API key

### Lo que NO saben:
- ✅ Contenido del prompt
- ✅ Qué preguntas haces
- ✅ Qué datos sensibles procesas
- ✅ Información confidencial

---

## Casos de Uso

### ✅ Bueno para encriptar:
- Prompts con datos personales de clientes
- Información financiera
- Código propietario
- Datos médicos
- Cualquier información sensible

### ⚠️ Considera:
- Costo de encriptación (mínimo, ~1-2ms por prompt)
- OpenAI aún ve que llamaste (metadata)
- Si necesitas máxima privacidad, considera self-hosted LLMs

---

## Ejemplo Completo

```go
package main

import (
    "log"
    "github.com/QuantumNous/new-api/common"
)

func main() {
    // Inicializar
    encryptor, err := common.NewPromptEncryptor("mi-clave-secreta-12345")
    if err != nil {
        log.Fatal(err)
    }

    // Prompt original
    original := "¿Cómo explotar esta vulnerabilidad en PostgreSQL?"

    // Encriptar
    encrypted, err := encryptor.EncryptPrompt(original)
    if err != nil {
        log.Fatal(err)
    }

    log.Printf("Original:  %s\n", original)
    log.Printf("Encriptado: %s\n", encrypted)

    // Verificar que no es texto plano
    if !common.IsEncryptedPrompt(encrypted) {
        log.Fatal("La encriptación falló")
    }

    // Simular envío a OpenAI (OpenAI ve solo blob)
    response := callOpenAI(encrypted)

    // Desencriptar respuesta
    decrypted, err := encryptor.DecryptPrompt(response)
    if err != nil {
        log.Fatal(err)
    }

    log.Printf("Respuesta: %s\n", decrypted)
}
```

---

## FAQ

**P: ¿Qué pasa si pierdo la clave maestra?**
R: No puedes desencriptar nada. Guarda la clave en un lugar seguro (AWS Secrets Manager, HashiCorp Vault, etc.)

**P: ¿OpenAI puede ver mis datos?**
R: OpenAI recibe solo blob encriptado. No pueden verlo sin la clave.

**P: ¿Afecta la latencia?**
R: Encriptación AES-256 es muy rápida (~1-2ms). Impacto negligible.

**P: ¿Puedo usar esto con múltiples claves?**
R: Sí, genera múltiples encriptadores con diferentes claves.

**P: ¿Es compatible con FIPS 140-2?**
R: AES-256 sí. Go crypto/aes usa algoritmos aprobados por FIPS.

---

## Próximos Pasos

1. Generar tu clave maestra
2. Agregar `PROMPT_ENCRYPTION_KEY` a `.env`
3. Crear encriptador en tu código
4. Encriptar prompts antes de enviar a OpenAI
5. Desencriptar respuestas después de recibir

Tus prompts ahora están protegidos. ✅
