# Configuración para Heroku - resuelve-api.lat

## Variables de entorno que DEBES configurar en Heroku

Ejecuta estos comandos desde tu terminal:

```bash
# 1. CRÍTICO: Configurar proxies para Heroku
heroku config:set TRUSTED_PROXIES="10.0.0.0/8,172.16.0.0/12,192.168.0.0/16" --app resuelve-api

# 2. Habilitar caché en memoria
heroku config:set MEMORY_CACHE_ENABLED=true --app resuelve-api

# 3. Verificar que SESSION_SECRET esté configurado (NO uses el del .env local)
heroku config:get SESSION_SECRET --app resuelve-api
# Si devuelve vacío, genera uno nuevo:
# En PowerShell:
# $secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
# heroku config:set SESSION_SECRET="$secret" --app resuelve-api

# 4. RECOMENDADO: Agregar Redis para evitar rate limiting inconsistente
heroku addons:create heroku-redis:mini --app resuelve-api
# Esto configura REDIS_URL automáticamente

# 5. Después de agregar Redis, habilítalo:
heroku config:set REDIS_CONN_STRING="$(heroku config:get REDIS_URL --app resuelve-api)" --app resuelve-api
```

## Para hacer deploy de las correcciones:

```bash
cd C:\Users\oskar\resuelve-api-core
git add .
git commit -m "Fix: Mejorar manejo de errores 500 y problemas de caché"
git push heroku main
```

## Para ver logs en tiempo real y diagnosticar:

```bash
# Ver todos los logs
heroku logs --tail --app resuelve-api

# Ver solo errores
heroku logs --tail --app resuelve-api | findstr /I "error panic 500"

# Ver estado de la app
heroku ps --app resuelve-api
```

## Correcciones aplicadas en el código:

1. ✅ **main.go**: Mejorado el retry con exponential backoff para InitChannelCache
2. ✅ **middleware/trusted_proxies.go**: Mejor logging de proxies configurados
3. ✅ **middleware/cache.go**: Headers de caché más estrictos para evitar el flash
4. ✅ **router/web-router.go**: Headers explícitos no-cache para index.html

## Qué esperar después del deploy:

- ❌ Los errores 500 al iniciar deberían desaparecer (mejor retry)
- ❌ El "flash" de página inicial debería reducirse o desaparecer (mejores headers de caché)
- ❌ Con Redis: rate limiting consistente entre todos los usuarios
- ⚠️ Sin Redis: puede seguir habiendo problemas de rate limiting inconsistente

## Costo de Redis en Heroku:

- **heroku-redis:mini** - $3/mes (512MB, recomendado)
- **heroku-redis:hobby-dev** - Gratis pero solo para desarrollo (25MB)

Si el presupuesto es limitado, puedes probar sin Redis primero y ver si las otras correcciones resuelven el problema.
