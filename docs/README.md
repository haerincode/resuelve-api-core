# Prompt Encryption Documentation

## Available Languages / Idiomas Disponibles / Langues Disponibles

Choose your language / Elige tu idioma / Choisissez votre langue:

- 🇺🇸 [English](en/PROMPT_ENCRYPTION.md)
- 🇪🇸 [Español](es/PROMPT_ENCRYPTION.md)
- 🇫🇷 [Français](fr/PROMPT_ENCRYPTION.md)
- 🇷🇺 [Русский](ru/PROMPT_ENCRYPTION.md)
- 🇯🇵 [日本語](ja/PROMPT_ENCRYPTION.md)
- 🇻🇳 [Tiếng Việt](vi/PROMPT_ENCRYPTION.md)

---

## What is Prompt Encryption? / ¿Qué es la Encriptación de Prompts?

**English:** End-to-end encryption for your AI prompts. Protect sensitive data when using OpenAI, Anthropic, and other LLM APIs.

**Español:** Encriptación end-to-end para tus prompts de IA. Protege datos sensibles al usar APIs de OpenAI, Anthropic y otros LLM.

**Français:** Chiffrement de bout en bout pour vos prompts IA. Protégez les données sensibles lors de l'utilisation des API OpenAI, Anthropic et autres LLM.

**Русский:** Сквозное шифрование для ваших AI промптов. Защитите конфиденциальные данные при использовании API OpenAI, Anthropic и других LLM.

**日本語:** AIプロンプトのエンドツーエンド暗号化。OpenAI、Anthropic、その他のLLM APIを使用する際に機密データを保護します。

**Tiếng Việt:** Mã hóa đầu cuối cho các prompt AI của bạn. Bảo vệ dữ liệu nhạy cảm khi sử dụng API OpenAI, Anthropic và LLM khác.

---

## Quick Start / Inicio Rápido

### 1. Generate Key / Generar Clave

```bash
openssl rand -hex 32
```

### 2. Configure / Configurar

```env
PROMPT_ENCRYPTION_KEY=your-generated-key-here
```

### 3. Done! / ¡Listo!

All prompts are now encrypted automatically.

Todos los prompts ahora están encriptados automáticamente.

---

## Documentation by Language

### 🇺🇸 English
- [Overview](en/PROMPT_ENCRYPTION.md)
- [FAQ](en/PROMPT_ENCRYPTION_FAQ.md)
- [Integration Guide](en/PROMPT_ENCRYPTION_INTEGRATION.md)

### 🇪🇸 Español
- [Resumen](es/PROMPT_ENCRYPTION.md)
- [FAQ](es/PROMPT_ENCRYPTION_FAQ.md)
- [Guía de Integración](es/PROMPT_ENCRYPTION_INTEGRATION.md)

### 🇫🇷 Français
- [Aperçu](fr/PROMPT_ENCRYPTION.md)

### 🇷🇺 Русский
- [Обзор](ru/PROMPT_ENCRYPTION.md)

### 🇯🇵 日本語
- [概要](ja/PROMPT_ENCRYPTION.md)

### 🇻🇳 Tiếng Việt
- [Tổng quan](vi/PROMPT_ENCRYPTION.md)

---

## Features / Características / Fonctionnalités

✅ **AES-256-GCM encryption** - Military-grade security

✅ **End-to-end** - Only you can decrypt

✅ **Open source** - Fully auditable code

✅ **Fast** - <2ms overhead per request

✅ **Compatible** - Works with OpenAI, Anthropic, Gemini, etc.

✅ **Automatic** - No code changes needed after setup

---

## Security / Seguridad / Sécurité

- **Algorithm**: AES-256-GCM (NIST FIPS 197 approved)
- **Authentication**: GCM provides AEAD
- **Nonce**: 12 bytes random per encryption
- **Key derivation**: SHA-256

**Compliant with / Compatible con:**
- GDPR Article 32
- HIPAA Security Rule § 164.312(a)(2)(iv)
- PCI-DSS 3.2.1
- SOC 2 Type II

---

## Contributing Translations

Want to add your language? / ¿Quieres agregar tu idioma?

1. Create `docs/[lang-code]/PROMPT_ENCRYPTION.md`
2. Translate from `docs/en/PROMPT_ENCRYPTION.md`
3. Submit PR

Languages needed / Idiomas necesarios:
- 🇩🇪 Deutsch
- 🇮🇹 Italiano
- 🇵🇹 Português
- 🇰🇷 한국어
- 🇨🇳 简体中文 (Simplified Chinese)
- 🇹🇼 繁體中文 (Traditional Chinese)

---

**Made with ❤️ by QuantumNous**

[GitHub](https://github.com/QuantumNous/new-api) | [Documentation](docs/en/PROMPT_ENCRYPTION.md) | [Report Issue](https://github.com/QuantumNous/new-api/issues)
