---
verb: 1
---

# Resuelve API Agent

Este asistente puede ayudarte con tu cuenta de Resuelve API, tokens, canales, logs de uso y recargas.

## get_user_self

Obtener información de la cuenta del usuario actual incluyendo saldo, grupo, email y cuota disponible. Call this when the user asks about their account, balance, quota, group membership, or personal information.

- classification: read
- run: adapter
- group: usuario

```js
const res = await api.get('/api/user/self')
return res.data
```

## get_user_models

Listar todos los modelos de IA que el usuario puede usar según su grupo y permisos. Call this when the user asks what AI models they can access, which models are available to them, or wants to know their model permissions.

- classification: read
- run: adapter
- group: usuario

```js
const res = await api.get('/api/user/models')
return res.data
```

## list_tokens

Listar todos los tokens de API del usuario con sus nombres, cuotas y estado. Call this when the user asks to see their API keys, list their tokens, or wants to know what tokens they have created.

- classification: read
- run: adapter
- group: tokens

```js
const res = await api.get('/api/token/')
return res.data
```

## create_token

Crear un nuevo token de API con nombre y cuota límite especificados. Call this when the user wants to create a new API key, generate a token, or needs a new access token for their applications.

- classification: write
- run: adapter
- group: tokens

### Parameters

- name (string, required): Nombre descriptivo para identificar el token
- remain_quota (integer, optional): Cuota límite del token (0 = sin límite si el usuario es admin)
- expired_time (integer, optional): Timestamp de expiración (-1 = sin expiración)
- unlimited_quota (boolean, optional): Si es true, el token no tiene límite de cuota

```js
const res = await api.post('/api/token/', {
  name: params.name,
  remain_quota: params.remain_quota,
  expired_time: params.expired_time,
  unlimited_quota: params.unlimited_quota
})
return res.data
```

## update_token_status

Habilitar o deshabilitar un token de API existente. Call this when the user wants to enable, disable, activate or deactivate an API key.

- classification: write  
- run: adapter
- group: tokens

### Parameters

- id (integer, required): ID del token a modificar
- status (integer, required): Nuevo estado (1 = habilitado, 2 = deshabilitado)

```js
const res = await api.put(`/api/token/status/${params.id}`, {
  status: params.status
})
return res.data
```

## delete_token

Eliminar permanentemente un token de API. Call this when the user wants to delete, remove or revoke an API token.

- classification: write
- run: adapter
- group: tokens

### Parameters

- id (integer, required): ID del token a eliminar

```js
const res = await api.delete(`/api/token/${params.id}`)
return res.data
```

## get_user_dashboard

Obtener estadísticas de uso general del usuario: cuota usada hoy, total de peticiones y gasto por modelo. Call this when the user wants to see their usage statistics, dashboard overview, or spending breakdown by model.

- classification: read
- run: adapter
- group: usuario

### Parameters

- start_timestamp (integer, optional): Timestamp inicio del rango de fechas
- end_timestamp (integer, optional): Timestamp fin del rango de fechas

```js
const params = new URLSearchParams()
if (args.start_timestamp) params.append('start_timestamp', args.start_timestamp)
if (args.end_timestamp) params.append('end_timestamp', args.end_timestamp)
const res = await api.get(`/api/user/dashboard?${params}`)
return res.data
```

## list_channels

Listar todos los canales (upstreams) configurados con su estado de conexión y modelos disponibles. Call this when the user wants to see their configured channels, upstream providers, or check channel status.

- classification: read
- run: adapter
- group: canales

```js
const res = await api.get('/api/channel/')
return res.data
```

## get_channel_models

Obtener lista de modelos disponibles en un canal específico mediante test de conectividad. Call this when the user wants to check what models are available on a specific channel or test channel connectivity.

- classification: read
- run: adapter
- group: canales

### Parameters

- id (integer, required): ID del canal a consultar

```js
const res = await api.get(`/api/channel/models/${params.id}`)
return res.data
```

## test_channel

Probar conectividad de un canal enviando una petición de prueba. Call this when the user wants to test if a channel is working properly or verify channel connectivity.

- classification: write
- run: adapter
- group: canales

### Parameters

- id (integer, required): ID del canal a probar
- model (string, required): Modelo a usar en la prueba

```js
const res = await api.get(`/api/channel/test/${params.id}/${params.model}`)
return res.data
```

## update_channel_status

Habilitar o deshabilitar un canal upstream. Call this when the user wants to enable, disable, activate or deactivate a channel.

- classification: write
- run: adapter
- group: canales

### Parameters

- id (integer, required): ID del canal a modificar
- status (integer, required): Nuevo estado (1 = habilitado, 2 = deshabilitado)

```js
const res = await api.put(`/api/channel/status/${params.id}`, {
  status: params.status
})
return res.data
```

## get_logs

Obtener logs de peticiones del usuario con detalles de uso, modelo utilizado y tokens consumidos. Call this when the user wants to see their request history, usage logs, or track their API calls.

- classification: read
- run: adapter
- group: logs

### Parameters

- p (integer, optional): Número de página
- page_size (integer, optional): Cantidad de logs por página (default 10)
- token_name (string, optional): Filtrar por nombre de token
- model_name (string, optional): Filtrar por nombre de modelo
- start_timestamp (integer, optional): Timestamp inicio del rango
- end_timestamp (integer, optional): Timestamp fin del rango
- channel (integer, optional): ID del canal upstream

```js
const params = new URLSearchParams()
if (args.p) params.append('p', args.p)
if (args.page_size) params.append('page_size', args.page_size)
if (args.token_name) params.append('token_name', args.token_name)
if (args.model_name) params.append('model_name', args.model_name)
if (args.start_timestamp) params.append('start_timestamp', args.start_timestamp)
if (args.end_timestamp) params.append('end_timestamp', args.end_timestamp)
if (args.channel) params.append('channel', args.channel)
const res = await api.get(`/api/log/?${params}`)
return res.data
```

## get_topup_info

Obtener configuración de métodos de pago habilitados y montos mínimos para recargas. Call this when the user asks what payment methods are available, minimum topup amounts, or wants to see payment options.

- classification: read
- run: adapter
- group: recargas

```js
const res = await api.get('/api/user/topup/info')
return res.data
```

## get_topup_history

Obtener historial de recargas del usuario con montos, métodos de pago y estado. Call this when the user wants to see their recharge history, payment history, or past transactions.

- classification: read
- run: adapter
- group: recargas

### Parameters

- p (integer, optional): Número de página
- page_size (integer, optional): Cantidad de registros por página

```js
const params = new URLSearchParams()
if (args.p) params.append('p', args.p)
if (args.page_size) params.append('page_size', args.page_size)
const res = await api.get(`/api/user/topup?${params}`)
return res.data
```

## get_status

Obtener estado general del sistema y configuración pública. Call this when the user wants to know system status, available features, or platform configuration.

- classification: read
- run: adapter
- group: sistema

```js
const res = await api.get('/api/status')
return res.data
```

### Returns

Retorna información sobre versión, métodos de autenticación disponibles (OAuth, Telegram, etc.), configuración de precios, modelos disponibles y estado del sistema.

## get_pricing

Obtener tarifas actuales por millón de tokens para todos los modelos disponibles. Call this when the user asks how much a model costs, wants to see pricing per token, or needs to compare model costs.

- classification: read
- run: adapter
- group: sistema

```js
const res = await api.get('/api/pricing')
return res.data
```

### Returns

Retorna los precios por millón de tokens de entrada y salida para cada modelo disponible.

## get_models_list

Listar todos los modelos de IA del catálogo completo de la plataforma con sus proveedores. Call this when the user wants to see all available models across the platform, including Claude, GPT, Gemini and other AI models in the catalog.

- classification: read
- run: adapter
- group: sistema

```js
const res = await api.get('/api/models')
return res.data
```

### Returns

Retorna lista completa de modelos con sus nombres, proveedores y disponibilidad.
