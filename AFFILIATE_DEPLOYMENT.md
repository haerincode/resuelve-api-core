# Sistema de Afiliados - Deployment Guide

Sistema completo de referidos integrado en New-API con comisiones automáticas del 30%.

## Arquitectura

- **Backend**: Integrado en Go (New-API existente)
- **Frontend**: 2 páginas HTML standalone (dashboard afiliado + admin)
- **Database**: PostgreSQL (misma DB de New-API)
- **Deploy**: Render (mismo servicio)

## 1. Migrations SQL

Correr en tu PostgreSQL de Render:

```bash
psql $DATABASE_URL < migrations/000_affiliate_system.sql
```

Esto crea:
- Tabla `affiliates` (datos afiliado, código, wallet USDT)
- Tabla `affiliate_commissions` (comisiones por recarga)
- View `affiliate_stats` (stats agregadas)
- Asegura columna `users.inviter_id` existe

## 2. Environment Variables (Render)

Agregar en Render Dashboard → Environment:

```bash
# JWT secret para auth afiliados (genera uno random seguro)
AFFILIATE_JWT_SECRET=tu-secret-muy-largo-y-aleatorio-minimo-32-chars

# URL frontend (tu dominio)
FRONTEND_URL=https://resuelve-api.lat

# Opcional: rate de comisión (default 30%)
COMMISSION_RATE=0.30
```

## 3. Subdomain Setup

En Render → Settings → Custom Domains:

1. Agregar: `affiliates.resuelve-api.lat`
2. Configurar DNS CNAME → `tu-app.onrender.com`

## 4. Crear Primer Afiliado (Admin)

Via psql o DBeaver:

```sql
-- Password: "admin123" (cámbialo después)
INSERT INTO affiliates (user_id, affiliate_code, email, full_name, password_hash)
VALUES (
    1, -- tu user_id de admin en tabla users
    'ADMIN',
    'tu-email@example.com',
    'Admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
);
```

## 5. Integrar Webhook en Recargas

Modificar handlers de topup para disparar comisión. En `controller/topup.go` o similar:

```go
import "github.com/QuantumNous/new-api/controller"

// Después de procesar recarga exitosa:
go controller.ProcessAffiliateCommission(userId, topupAmount)
```

O llamar endpoint webhook:

```bash
POST /api/affiliate/webhook/topup
Content-Type: application/json
Authorization: Bearer YOUR_WEBHOOK_SECRET

{
  "user_id": 123,
  "amount": 10.00
}
```

## 6. Frontend: Agregar Script Tracking

En tu landing page HTML (antes de `</body>`):

```html
<script>
// Captura ?ref=CODE y guarda cookie 30 días
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
        document.cookie = `ref_code=${ref}; path=/; max-age=${30*24*60*60}; SameSite=Lax`;
    }
})();
</script>
```

## 7. Modificar Registro New-API

En el controller de registro, leer cookie y asociar:

```go
func Register(c *gin.Context) {
    // ... registro normal ...
    
    // Leer ref_code de cookie
    refCode, _ := c.Cookie("ref_code")
    if refCode != "" {
        var affiliate model.Affiliate
        if err := model.DB.Where("affiliate_code = ?", refCode).First(&affiliate).Error; err == nil {
            newUser.InviterId = affiliate.UserID
        }
    }
    
    model.DB.Create(&newUser)
    // ...
}
```

## 8. URLs Funcionales

Después del deploy:

- **Dashboard Afiliado**: `https://resuelve-api.lat/affiliate-dashboard.html`
- **Admin Panel**: `https://resuelve-api.lat/affiliate-admin.html`
- **API Base**: `https://resuelve-api.lat/api/affiliate/*`

## 9. Uso Post-Deploy

### Para Afiliados:
1. Login en `/affiliate-dashboard.html`
2. Ver código único y link: `resuelve-api.lat?ref=CODIGO`
3. Compartir link
4. Ver stats y comisiones pendientes
5. Configurar wallet USDT

### Para Admin:
1. Login en `/affiliate-admin.html` (con tu user admin)
2. Ver todas comisiones pendientes
3. Seleccionar y marcar como pagadas
4. Exportar CSV para hacer transferencias USDT

## 10. Testing Local

```bash
# Run migrations
psql $DATABASE_URL < migrations/000_affiliate_system.sql

# Build
go build -o new-api.exe

# Run
./new-api.exe

# Test endpoints
curl http://localhost:3000/api/affiliate/register \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test"}'

curl http://localhost:3000/affiliate-dashboard.html
```

## Endpoints API

### Público
- `POST /api/affiliate/register` - Crear cuenta afiliado
- `POST /api/affiliate/login` - Login (devuelve JWT)

### Autenticado (Bearer token)
- `GET /api/affiliate/dashboard` - Stats del afiliado
- `GET /api/affiliate/commissions` - Historial comisiones
- `PUT /api/affiliate/wallet` - Actualizar wallet USDT

### Admin (requiere ser root user)
- `GET /api/affiliate/admin/affiliates` - Todos los afiliados
- `GET /api/affiliate/admin/commissions/pending` - Pendientes
- `POST /api/affiliate/admin/commissions/mark-paid` - Marcar pagadas
- `GET /api/affiliate/admin/export/pending` - CSV export

### Webhook (interno)
- `POST /api/affiliate/webhook/topup` - Procesar comisión post-recarga

## Troubleshooting

**Build falla en Render:**
- Verificar `go.mod` tiene `github.com/golang-jwt/jwt/v5`
- Verificar `golang.org/x/crypto` instalado

**Comisiones no se generan:**
- Verificar webhook integrado en topup handler
- Revisar logs: `heroku logs --tail` o Render logs

**Dashboard no carga:**
- Verificar rutas en `router/web-router.go`
- Verificar archivos HTML existen en `web/`

**Auth falla:**
- Verificar `AFFILIATE_JWT_SECRET` configurado en Render
- Token debe incluir `Authorization: Bearer <token>`

## Security Notes

- Passwords afiliados hasheados con bcrypt (cost 10)
- JWT tokens expiran en 7 días
- Admin endpoints requieren `RoleRootUser`
- Rate limiting via middleware existente New-API
- CORS configurado para `FRONTEND_URL`

## Próximos Pasos

1. ✅ Deploy código
2. ✅ Run migrations
3. ✅ Configurar env vars
4. ✅ Setup subdomain
5. ⏳ Integrar webhook en topup
6. ⏳ Agregar script tracking en landing
7. ⏳ Modificar registro para leer cookie
8. ⏳ Test flujo completo
9. ⏳ Invitar primeros afiliados

## Stack Usado

- **Backend**: Go 1.26+, Gin, GORM
- **Auth**: JWT (golang-jwt/jwt/v5), bcrypt
- **Frontend**: HTML + Vanilla JS (zero deps)
- **DB**: PostgreSQL 12+
- **Deploy**: Render Web Service

---

**Tiempo estimado de setup completo: 1-2 horas**

Questions? Check logs o revisa código en `controller/affiliate*.go`.
