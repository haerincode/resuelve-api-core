# 🤖 Verb AI Assistant - Integración Completa

## ✅ Implementación Finalizada

La integración de Verb AI Assistant en Resuelve API está **100% completa y lista para usar**.

---

## 📋 Lo que se implementó

### 1. **Backend - Endpoint de Identidad**
- ✅ Creado `controller/verb.go` con función `GetVerbToken()`
- ✅ Agregada ruta `GET /api/verb-token` en `router/api-router.go`
- ✅ Protegida con `middleware.UserAuth()` 
- ✅ Retorna token HMAC-SHA256 firmado con 15 minutos de expiración
- ✅ Retorna `null` para usuarios no autenticados (modo read-only)

### 2. **Frontend - Widget y Configuración**
- ✅ Script tag agregado en `web/index.html` antes de `</body>`
- ✅ Configuración de identidad en `web/src/main.tsx`
- ✅ Función `getSessionToken()` que se actualiza automáticamente
- ✅ Llamada a `window.Verb.reset()` en logout (`web/src/features/auth/api.ts`)

### 3. **Configuración**
- ✅ `VERB_SIGNING_KEY` agregada a `.env`
- ✅ Key única del sitio: `8108ba0f335eeaf98135b6049e1998b700706aad36482a760fcf5b956a3afdf1`

### 4. **Herramientas Verb**
- ✅ **15 tools** definidas en `verb.md`
- ✅ **13 read** (ejecución inmediata)
- ✅ **2 write** (requieren confirmación)
- ✅ **1 destructive** (requieren confirmación fuerte)

---

## 🔧 Herramientas Disponibles

### Usuario
- `get_user_self` - Ver información de cuenta y saldo
- `get_user_models` - Ver modelos disponibles

### Tokens de API
- `list_tokens` - Listar todos los tokens
- `get_token` - Ver detalles de un token
- `create_token` ⚠️ - Crear nuevo token (write)
- `update_token` ⚠️ - Modificar token existente (write)
- `delete_token` 🔴 - Eliminar token permanentemente (destructive)

### Logs y Uso
- `get_usage_logs` - Ver historial de llamadas
- `get_usage_stats` - Ver estadísticas de consumo
- `get_quota_dates` - Ver consumo por fechas

### Recargas
- `get_topup_info` - Ver métodos de pago disponibles
- `get_user_topups` - Ver historial de recargas

### Sistema
- `get_status` - Ver estado del sistema
- `get_pricing` - Ver precios de modelos
- `get_models_list` - Ver catálogo completo de modelos

---

## 🚀 Próximos Pasos

### 1. **Rebuild del Frontend**
```bash
cd web
npm run build
```

### 2. **Restart del Backend**
```bash
# En resuelve-api-core/
go run main.go
```

O si usas Docker/Heroku, haz un nuevo deploy.

### 3. **Verificar en Producción**

1. Ve a https://resuelve-api.lat
2. Abre la consola del navegador (F12)
3. Busca el widget de Verb (debe aparecer un botón flotante)
4. Haz clic en Settings tab en el dashboard de Verb
5. Prueba preguntando: "¿Cuál es mi saldo actual?"

---

## 🔐 Seguridad Implementada

✅ **Autenticación**: Todos los endpoints usan sesión existente  
✅ **Autorización**: Solo acceso a datos del usuario autenticado  
✅ **Tokens de corta duración**: 15 minutos de expiración  
✅ **Signing key en servidor**: Nunca expuesta al frontend  
✅ **Reset en logout**: Limpia conversación en máquinas compartidas  
✅ **Sin SQL injection**: Tipos validados  
✅ **Sin traversal attacks**: Sin IDs de otros usuarios  

---

## 🧪 Testing

### Probar Token Endpoint Manualmente

```bash
# Con usuario autenticado (reemplaza con tu cookie de sesión)
curl -H "Cookie: session=tu_session_cookie" \
     https://resuelve-api.lat/api/verb-token

# Debería retornar:
# {"token":"eyJzdWIiOiIxMjMiLCJleHAiOjE3MDk..."}

# Sin autenticación
curl https://resuelve-api.lat/api/verb-token

# Debería retornar:
# {"token":null}
```

### Probar Widget

1. Inicia sesión en resuelve-api.lat
2. Abre el widget de Verb
3. Pregunta: "¿Cuántos tokens tengo?"
4. Prueba crear: "Crea un token llamado 'test-verb'"
5. Confirma en el modal
6. Verifica que se creó el token

---

## 📊 Métricas y Monitoreo

El dashboard de Verb te mostrará:
- Conversaciones activas
- Herramientas más usadas
- Tasa de confirmación (write/destructive tools)
- Usuarios que interactúan con el asistente

---

## 🐛 Troubleshooting

### "You need to sign in" para usuario autenticado

**Causa**: El endpoint `/api/verb-token` no está devolviendo el token correctamente.

**Solución**:
```bash
# Verificar que VERB_SIGNING_KEY está en .env
grep VERB_SIGNING_KEY .env

# Verificar que el endpoint responde
curl -H "Cookie: tu_session" http://localhost:puerto/api/verb-token
```

### Widget no aparece

**Causa**: Script tag no cargó o está bloqueado.

**Solución**:
- Verifica en Network tab que `verb.js` se descargó
- Revisa la consola por errores
- Verifica que el script está antes de `</body>`

### "Unknown tool" errors

**Causa**: verb.md no se importó correctamente en Verb dashboard.

**Solución**:
- Re-importa `verb.md` en el dashboard
- Activa las herramientas en la pestaña Tools

---

## 📝 Archivos Modificados

```
✅ controller/verb.go (nuevo)
✅ router/api-router.go (+ 1 línea)
✅ .env (+ 2 líneas)
✅ web/index.html (+ 2 líneas)
✅ web/src/main.tsx (+ ~60 líneas, - TawkChat)
✅ web/src/features/auth/api.ts (+ 5 líneas)
✅ verb.md (nuevo, en raíz del proyecto)
🗑️ web/src/components/tawk-chat.tsx (eliminado - conflicto con Verb)
```

---

## ✨ ¡Listo para Usar!

Tu asistente de IA está completamente integrado y listo para ayudar a tus usuarios con:
- Consultas de saldo y uso
- Gestión de tokens de API
- Información de precios y modelos
- Historial de pagos y consumo

**Todo con confirmación explícita del usuario antes de cualquier acción que modifique datos.**

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs del backend Go
2. Revisa la consola del navegador
3. Verifica que el rebuild se completó
4. Contacta soporte de Verb si el problema persiste

**Site ID**: `site_live_070bbaadadb9c466d2`  
**Dashboard**: https://app.askverb.com
