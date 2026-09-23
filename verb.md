---
verb: 1
---

# Resuelve API Agent

Este asistente puede ayudarte con tu cuenta de Resuelve API, tokens, canales, logs de uso y recargas.

## get_user_self

Obtener información de la cuenta del usuario actual incluyendo saldo, grupo, email y cuota disponible. Call this when the user asks about their account, balance, quota, group membership, or personal information.

- classification: read
- run: browser
- method: GET
- path: /api/user/self
- group: usuario

## get_user_models

Listar todos los modelos de IA que el usuario puede usar según su grupo y permisos. Call this when the user asks what AI models they can access, which models are available to them, or wants to know their model permissions.

- classification: read
- run: browser
- method: GET
- path: /api/user/models
- group: usuario

## list_tokens

Listar todos los tokens de API del usuario con sus nombres, cuotas y estado. Call this when the user asks to see their API keys, list their tokens, or wants to know what tokens they have created.

- classification: read
- run: browser
- method: GET
- path: /api/token/
- group: tokens

### Arguments

- `p` (integer, optional, min 1) Número de página para paginación, por defecto 1
- `size` (integer, optional, min 1, max 100) Cantidad de tokens por página, por defecto 10

## get_token

Obtener detalles completos de un token específico por su ID numérico. Call this when the user asks about a specific token they know by ID or wants detailed information about one token.

- classification: read
- run: browser
- method: GET
- path: /api/token/{token_id}
- group: tokens

### Arguments

- `token_id` (integer, required) El ID del token, como aparece en la lista de tokens

## create_token

Crear un nuevo token de API con nombre, cuota y fecha de expiración opcionales. Call this when the user wants to generate a new API key, create a token, or needs a new access credential.

- classification: write
- run: browser
- method: POST
- path: /api/token/
- confirm: "¿Crear nuevo token '{name}'?"
- group: tokens

### Arguments

- `name` (string, required, max 50) Nombre descriptivo para el token
- `remain_quota` (integer, optional, min -1) Cuota asignada al token (-1 = ilimitado), por defecto ilimitado
- `expired_time` (integer, optional, min -1) Timestamp de expiración (-1 = nunca expira), por defecto nunca expira
- `unlimited_quota` (boolean, optional) Si el token tiene cuota ilimitada, por defecto true

## update_token

Actualizar nombre, cuota o fecha de expiración de un token existente. Call this when the user wants to modify, rename, change the quota of, or extend the expiration of an existing token.

- classification: write
- run: browser
- method: PUT
- path: /api/token/
- confirm: "¿Actualizar token '{name}'?"
- group: tokens

### Arguments

- `id` (integer, required) ID del token a actualizar
- `name` (string, required, max 50) Nuevo nombre del token
- `remain_quota` (integer, optional, min -1) Nueva cuota (-1 = ilimitado)
- `expired_time` (integer, optional, min -1) Nuevo timestamp de expiración (-1 = nunca expira)
- `unlimited_quota` (boolean, optional) Si el token tiene cuota ilimitada

## delete_token

Eliminar permanentemente un token de API, revocando su acceso de inmediato. Call this only when the user explicitly asks to delete, remove, or revoke a specific token.

- classification: destructive
- run: browser
- method: DELETE
- path: /api/token/{token_id}
- confirm: "¿Eliminar token ID {token_id}? Esta acción no se puede deshacer."
- group: tokens

### Arguments

- `token_id` (integer, required) ID del token a eliminar

## get_usage_logs

Obtener el historial detallado de llamadas a la API con timestamps, modelos usados y costos. Call this when the user asks about their API usage history, wants to see which models they've used, or needs to review past API calls.

- classification: read
- run: browser
- method: GET
- path: /api/log/self
- group: logs

### Arguments

- `p` (integer, optional, min 1) Número de página, por defecto 1
- `size` (integer, optional, min 1, max 100) Cantidad de logs por página, por defecto 10
- `type` (integer, optional, one of: 1, 2) Tipo de log (1=consumo, 2=recargas)
- `start_timestamp` (integer, optional, min 0) Timestamp de inicio del rango de fechas
- `end_timestamp` (integer, optional, min 0) Timestamp de fin del rango de fechas
- `model_name` (string, optional, max 100) Filtrar por nombre del modelo (ej: claude-opus-5-20241022)
- `token_name` (string, optional, max 100) Filtrar por nombre del token

## get_usage_stats

Obtener estadísticas agregadas de consumo incluyendo cuota total usada, RPM y TPM. Call this when the user asks how much they've spent, wants a summary of their usage, or needs aggregate consumption statistics.

- classification: read
- run: browser
- method: GET
- path: /api/log/self/stat
- group: logs

### Arguments

- `type` (integer, optional, one of: 1, 2) Tipo de log (1=consumo, 2=recargas)
- `start_timestamp` (integer, optional, min 0) Timestamp de inicio del rango
- `end_timestamp` (integer, optional, min 0) Timestamp de fin del rango
- `model_name` (string, optional, max 100) Filtrar por modelo
- `token_name` (string, optional, max 100) Filtrar por token

### Returns

Retorna estadísticas con cuota usada, RPM y TPM del período especificado.

## get_topup_info

Obtener lista de métodos de pago disponibles, montos mínimos y opciones de recarga. Call this when the user asks how to add balance, what payment methods are available, minimum recharge amounts, or needs information about topping up their account.

- classification: read
- run: browser
- method: GET
- path: /api/user/topup/info
- group: recargas

### Returns

Retorna métodos de pago disponibles (Webpay, Flow, Stripe, USDT), montos mínimos y opciones de recarga.

## get_user_topups

Listar el historial completo de recargas y pagos realizados por el usuario. Call this when the user asks about their payment history, past recharges, or wants to see their transaction records.

- classification: read
- run: browser
- method: GET
- path: /api/user/topup/self
- group: recargas

### Arguments

- `p` (integer, optional, min 1) Número de página
- `size` (integer, optional, min 1, max 100) Cantidad de recargas por página

## get_quota_dates

Obtener datos de consumo diario desglosados por fecha para análisis histórico. Call this when the user wants to see their daily usage, analyze consumption patterns over time, or needs historical usage data.

- classification: read
- run: browser
- method: GET
- path: /api/data/self
- group: datos

### Arguments

- `start_timestamp` (integer, optional, min 0) Timestamp de inicio
- `end_timestamp` (integer, optional, min 0) Timestamp de fin

## get_status

Obtener configuración general del sistema incluyendo versión, métodos de autenticación y estado del servicio. Call this when the user asks about system status, service availability, what OAuth providers are enabled, or general platform configuration.

- classification: read
- run: browser
- method: GET
- path: /api/status
- group: sistema

### Returns

Retorna información sobre versión, métodos de autenticación disponibles (OAuth, Telegram, etc.), configuración de precios, modelos disponibles y estado del sistema.

## get_pricing

Obtener tarifas actuales por millón de tokens para todos los modelos disponibles. Call this when the user asks how much a model costs, wants to see pricing per token, or needs to compare model costs.

- classification: read
- run: browser
- method: GET
- path: /api/pricing
- group: sistema

### Returns

Retorna los precios por millón de tokens de entrada y salida para cada modelo disponible.

## get_models_list

Listar todos los modelos de IA del catálogo completo de la plataforma con sus proveedores. Call this when the user wants to see all available models across the platform, including Claude, GPT, Gemini and other AI models in the catalog.

- classification: read
- run: browser
- method: GET
- path: /api/models
- group: sistema

### Returns

Retorna lista completa de modelos con sus nombres, proveedores y disponibilidad.
