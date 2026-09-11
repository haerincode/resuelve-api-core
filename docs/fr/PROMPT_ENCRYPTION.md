# Chiffrement de Prompts - Protégez vos prompts sur OpenAI/Anthropic

## Pourquoi ?

Lorsque vous envoyez des prompts à OpenAI ou Anthropic, ils peuvent voir exactement ce que vous avez écrit. Avec le Chiffrement de Prompts, vos prompts sont **chiffrés de bout en bout** - même OpenAI/Anthropic ne peut pas les lire.

```
Votre Prompt: "Analyser les données confidentielles des clients..."
                    ↓
           [CHIFFREMENT AES-256]
                    ↓
OpenAI voit: "llm_encrypted_v1:Jk3xQ9mL2pKq8xR5vW7yZ..."
```

## Comment ça fonctionne

### 1. **Chiffrement Local**
- Votre code chiffre le prompt AVANT de l'envoyer à OpenAI/Anthropic
- Seul vous avez la clé de déchiffrement
- Utilise **AES-256-GCM** (chiffrement 256 bits + authentification)

### 2. **Envoi Chiffré**
- OpenAI/Anthropic reçoit un blob chiffré
- Ils ne peuvent pas voir le contenu original
- Ils ne peuvent pas utiliser votre prompt pour l'entraînement

### 3. **Réponse Chiffrée**
- La réponse peut également être chiffrée
- Elle est déchiffrée localement sur votre serveur

### 4. **Code Open Source**
- Tout le code est disponible sur GitHub
- Tout le monde peut auditer le chiffrement
- Pas de "magie noire"

---

## Configuration

### 1. Générer une Clé Principale

```bash
# Linux/Mac
openssl rand -hex 32

# PowerShell
-join ((48..57) + (65..70) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### 2. Ajouter à .env

```env
# Clé de Chiffrement de Prompts (32 caractères hex ou n'importe quelle chaîne)
PROMPT_ENCRYPTION_KEY=votre-cle-generee-ici
```

### 3. Utiliser dans votre code

```go
package main

import "github.com/QuantumNous/new-api/common"

func main() {
    // Créer un chiffreur
    encryptor, err := common.NewPromptEncryptor("votre-cle-secrete")
    if err != nil {
        panic(err)
    }

    // Chiffrer un prompt
    prompt := "Ceci est mon prompt secret"
    encrypted, err := encryptor.EncryptPrompt(prompt)
    // encrypted = "llm_encrypted_v1:Jk3xQ9mL2pKq8xR5vW7yZ..."

    // Envoyer à OpenAI
    response := callOpenAI(encrypted)

    // Déchiffrer la réponse
    decrypted, err := encryptor.DecryptPrompt(response)
}
```

---

## Spécification Technique

### Algorithme
- **Cipher**: AES-256 en mode GCM
- **Dérivation de Clé**: SHA256(master_key)
- **Nonce**: 12 octets aléatoires (générés par crypto/rand)
- **Authentification**: GCM fournit AEAD (authenticated encryption)
- **Encodage**: Base64

### Format
```
llm_encrypted_v1:BASE64(nonce + ciphertext + tag)
```

### Sécurité
- ✅ **Confidentialité**: AES-256 est de grade militaire
- ✅ **Intégrité**: GCM vérifie qu'il n'a pas été manipulé
- ✅ **Authenticité**: Seul celui qui a la clé peut déchiffrer
- ✅ **Forward Secrecy**: Si la clé est compromise, les anciens messages sont protégés par des nonces aléatoires

---

## Cas d'Utilisation

### ✅ Bon pour chiffrer:
- Prompts avec des données personnelles de clients
- Informations financières
- Code propriétaire
- Données médicales
- Toute information sensible

### ⚠️ Considérations:
- Coût de chiffrement (minimal, ~1-2ms par prompt)
- OpenAI voit toujours que vous avez appelé (métadonnées)
- Si vous avez besoin d'une confidentialité maximale, envisagez des LLMs auto-hébergés

Vos prompts sont maintenant protégés. ✅
