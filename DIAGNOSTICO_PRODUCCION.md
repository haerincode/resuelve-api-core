# Diagnóstico: Errores 500 en resuelve-api.lat

## Problemas Identificados

### 1. **CRÍTICO: Configuración de TRUSTED_PROXIES para Heroku**

**Problema**: Tu `.env` actual tiene `TRUSTED_PROXIES=127.0.0.1`, pero Heroku usa proxies externos.

**Solución**: En las variables de entorno de Heroku, configura:
```bash
TRUSTED_PROXIES=10.0.0.0/8,172.16.0.0/12,192.168.0.0/16
```

O mejor aún, confía en los rangos de Heroku específicamente. Para aplicarlo ahora:
```bash
heroku config:set TRUSTED_PROXIES="10.0.0.0/8,172.16.0.0/12" --app resuelve-api
```

### 2. **CRÍTICO: Race Condition en InitChannelCache**

**Problema**: El código en `main.go:97-109` tiene un panic recovery que indica fallos intermitentes en la inicialización del caché.

**Síntoma**: Algunos usuarios reciben error 500 cuando el servidor inicia y el caché no se ha sincronizado correctamente.

**Solución inmediata**: Agregar retry más robusto y health check.

### 3. **Rate Limiting sin Redis causa bloqueos inconsistentes**

**Problema**: Sin Redis, cada dyno tiene su propio rate limiter en memoria. Usuarios pueden ser bloqueados aleatoriamente.

**Síntoma**: Algunos usuarios reciben 500 o 429 (demasiadas solicitudes) de forma inconsistente.

**Solución**: Configurar Redis en Heroku:
```bash
heroku addons:create heroku-redis:mini --app resuelve-api
# Esto configura automáticamente REDIS_URL
```

Luego actualiza tu `.env` para producción:
```bash
REDIS_CONN_STRING=${REDIS_URL}  # Heroku lo configura automáticamente
MEMORY_CACHE_ENABLED=true
```

### 4. **Problema de carga del frontend (flash inicial)**

**Problema**: El middleware de caché (`gin_static_cache.go`) puede estar causando que se sirvan versiones cacheadas incorrectas.

**Síntoma**: Usuarios ven brevemente una página inicial antes de cargar la principal.

**Posible causa**: 
- Cache-Control headers conflictivos entre `cache.go` y `gin_static_cache.go`
- El index.html se cachea cuando no debería

### 5. **Falta de health checks adecuados**

**Problema**: Heroku puede enviar tráfico a dynos que aún no terminaron de inicializar sus cachés.

## Soluciones Paso a Paso

### Paso 1: Configurar variables de entorno en Heroku (URGENTE)

```bash
# 1. Configurar proxies correctos
heroku config:set TRUSTED_PROXIES="10.0.0.0/8,172.16.0.0/12,192.168.0.0/16" --app resuelve-api

# 2. Habilitar caché en memoria
heroku config:set MEMORY_CACHE_ENABLED=true --app resuelve-api

# 3. Configurar timeout más alto para inicialización
heroku config:set SYNC_FREQUENCY=30 --app resuelve-api

# 4. Verificar que SESSION_SECRET esté configurado
heroku config:get SESSION_SECRET --app resuelve-api
# Si no existe o es "random_string", configúralo:
heroku config:set SESSION_SECRET="$(openssl rand -hex 32)" --app resuelve-api
```

### Paso 2: Agregar Redis (recomendado para producción)

```bash
# Agregar Redis addon (plan mini gratuito o de pago según necesites)
heroku addons:create heroku-redis:mini --app resuelve-api

# Verificar que REDIS_URL esté configurado
heroku config:get REDIS_URL --app resuelve-api

# Habilitar Redis en la app
heroku config:set REDIS_CONN_STRING="${REDIS_URL}" --app resuelve-api
```

### Paso 3: Verificar logs en tiempo real

```bash
# Ver logs de errores
heroku logs --tail --app resuelve-api | grep -i "error\|panic\|500"

# Ver estado de los dynos
heroku ps --app resuelve-api

# Ver métricas
heroku metrics --app resuelve-api
```

### Paso 4: Agregar health check endpoint

El código ya tiene `/api/status` pero necesitamos asegurarnos de que Heroku lo use correctamente.

## Código a Modificar

### 1. Mejorar el manejo de panic en InitChannelCache (`main.go`)

Reemplazar líneas 96-109 con:
