# Sistema de Afiliados Resuelve-API

Sistema completo de comisiones con tracking automático, dashboard afiliado, panel admin pagos USDT.

## Stack

- **Backend:** FastAPI + PostgreSQL
- **Frontend:** HTML + Vanilla JS
- **Deploy:** Render
- **Comisión:** 30% recargas

## Estructura

```
affiliate-api/
├── main.py                    # FastAPI API
├── requirements.txt
├── dashboard.html             # Dashboard afiliado
├── admin.html                 # Panel admin
├── referral-tracker.js        # Script captura refs
├── Procfile
└── runtime.txt

affiliate_system.sql           # Schema DB
controller/affiliate_webhook.go # Webhook New-API
DEPLOYMENT_AFFILIATE.md        # Instrucciones completas
```

## Features

### Afiliado
- Código único auto-generado
- Link compartible `?ref=CODE`
- Stats: pendiente, total ganado, # referidos
- Wallet USDT configurable
- Historial comisiones

### Admin
- Ver todos afiliados
- Comisiones pendientes
- Marcar como pagadas (batch)
- Exportar CSV pagos
- Stats globales

### Tracking
- Cookie 30 días
- Auto-inject en registro New-API
- Webhook post-recarga
- Comisión 30% automática

## Quick Start

### 1. DB
```bash
psql $DATABASE_URL < affiliate_system.sql
```

### 2. Deploy API
```bash
# Render → New Web Service
# Root: affiliate-api
# Build: pip install -r requirements.txt
# Start: python main.py

# Env vars:
DATABASE_URL=postgresql://...
JWT_SECRET=random32chars
WEBHOOK_SECRET=random32chars
COMMISSION_RATE=0.30
```

### 3. Integrar New-API

`router/api-router.go`:
```go
apiRouter.POST("/webhook/affiliate", controller.ProcessAffiliateCommission)
```

En topup handlers (post-pago exitoso):
```go
// Trigger commission
webhookURL := "https://tu-api.onrender.com/api/webhook/topup"
payload := map[string]interface{}{
    "user_id": userId, "amount": quota, "topup_id": topupId,
}
// ... POST request con X-Webhook-Secret header
```

### 4. Landing Page

```html
<script src="https://tu-static.onrender.com/referral-tracker.js"></script>
```

## URLs

- API: `/api/affiliate/login`, `/api/affiliate/dashboard`, `/api/admin/*`
- Dashboard: `/dashboard.html`
- Admin: `/admin.html`
- Health: `/health`

## Flujo

1. Usuario abre `resuelve-api.lat?ref=ABC123`
2. Cookie guardada 30 días
3. Registro → `inviter_id` seteado
4. Usuario recarga $100
5. Webhook → comisión $30 creada
6. Afiliado ve $30 pendiente
7. Admin marca pagado → USDT transfer manual
8. Stats actualizadas

## Testing

```bash
# Captura
curl https://resuelve-api.lat?ref=TEST123
# → cookie ref_code=TEST123

# Registro (verificar inviter_id en DB)
# Recarga (verificar comisión creada)

# Dashboard
open https://tu-static.onrender.com/dashboard.html
# Login con email afiliado

# Admin
open https://tu-static.onrender.com/admin.html
# Login con admin JWT token
```

## Seguridad

- JWT 7 días expiry
- Webhook secret validation
- CORS configurado
- Rate limiting activo
- Admin role check

Ver `DEPLOYMENT_AFFILIATE.md` para instrucciones completas.
