# Instrucciones de Deployment - Sistema de Afiliados Resuelve-API

## 1. Preparación Base de Datos

### PostgreSQL (Render/Railway/Supabase)
```bash
# Conectar a tu DB de New-API
psql $DATABASE_URL

# Ejecutar script SQL
\i affiliate_system.sql

# Verificar tablas creadas
\dt commissions
\dt affiliates
```

### Verificar columnas en users
```sql
-- Si faltan columnas, agregar:
ALTER TABLE users ADD COLUMN IF NOT EXISTS inviter_id INTEGER;
-- (aff_code, aff_count, aff_quota, aff_history ya existen en New-API)
```

## 2. Deploy API Python (Render)

### Crear Web Service en Render
1. Dashboard → New → Web Service
2. Conectar repo (o deploy manual)
3. Configuración:
   - **Name:** `resuelve-api-affiliate`
   - **Region:** Oregon (US West)
   - **Branch:** main
   - **Root Directory:** `affiliate-api`
   - **Runtime:** Python 3.11
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python main.py`
   - **Instance Type:** Free

### Variables de Entorno
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=tu_secreto_seguro_aleatorio_32_chars
COMMISSION_RATE=0.30
WEBHOOK_SECRET=otro_secreto_para_webhook
PORT=8080
```

### Deploy
```bash
cd affiliate-api
git add .
git commit -m "Add affiliate system"
git push

# O deploy manual:
# Render → Deploy → Manual Deploy
```

## 3. Servir HTML Estáticos

### Opción A: Render Static Site (separado)
1. Render → New → Static Site
2. Nombre: `resuelve-api-affiliate-dash`
3. Publish Directory: `affiliate-api`
4. Build Command: (vacío)
5. Deploy

URLs resultantes:
- Dashboard: `https://resuelve-api-affiliate-dash.onrender.com/dashboard.html`
- Admin: `https://resuelve-api-affiliate-dash.onrender.com/admin.html`

### Opción B: Servir desde FastAPI (mismo servicio)

Agregar a `main.py` después de las rutas:

```python
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

@app.get("/dashboard")
async def dashboard():
    return FileResponse("dashboard.html")

@app.get("/admin")
async def admin():
    return FileResponse("admin.html")
```

## 4. Integrar Webhook con New-API

### 4.1 Agregar ruta en New-API

Editar `router/api-router.go`, agregar antes de la línea del cierre `}`:

```go
apiRouter.POST("/webhook/affiliate", controller.ProcessAffiliateCommission)
```

### 4.2 Llamar webhook desde topup

Buscar controlador de topup (ej: `controller/topup_stripe.go`, `topup_waffo_pancake.go`, etc.)

Después de confirmar pago exitoso, agregar:

```go
// Trigger affiliate commission
go func(userID, amount, topupID int) {
    webhookURL := "https://resuelve-api-affiliate.onrender.com/api/webhook/topup"
    webhookSecret := os.Getenv("WEBHOOK_SECRET")
    
    payload := map[string]interface{}{
        "user_id":  userID,
        "amount":   amount,
        "topup_id": topupID,
    }
    
    jsonData, _ := json.Marshal(payload)
    req, _ := http.NewRequest("POST", webhookURL, bytes.NewBuffer(jsonData))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("X-Webhook-Secret", webhookSecret)
    
    client := &http.Client{Timeout: 10 * time.Second}
    resp, err := client.Do(req)
    if err != nil {
        logger.SysLog("Affiliate webhook error: " + err.Error())
    } else {
        resp.Body.Close()
    }
}(user.Id, quota, topupRecord.Id)
```

### 4.3 Compilar y deploy New-API
```bash
cd /ruta/a/new-api
make build
# O docker build si usas Docker

# Deploy a Render/Railway según tu setup
```

## 5. Agregar Script de Captura en Landing

En tu landing page principal (`index.html`, etc):

```html
<!-- Antes del </body> -->
<script src="https://resuelve-api-affiliate-dash.onrender.com/referral-tracker.js"></script>
```

O inline:
```html
<script>
// Contenido de referral-tracker.js
(function() { /* ... código del tracker ... */ })();
</script>
```

## 6. Configurar CORS

Si API y dashboard en dominios diferentes, en `main.py` ya está configurado:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción: ["https://resuelve-api.lat"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 7. Actualizar URLs en HTML

En `dashboard.html` y `admin.html`, cambiar:

```javascript
const API_URL = 'https://resuelve-api-affiliate.onrender.com/api';
```

Por tu URL real de Render.

## 8. Testing

### Test captura referido
1. Abrir: `https://resuelve-api.lat/?ref=ABC123`
2. Verificar cookie en DevTools: `document.cookie`
3. Registrarse
4. Verificar en DB: `SELECT inviter_id FROM users WHERE username='nuevo'`

### Test comisión
1. Usuario referido recarga $10
2. Verificar log backend New-API
3. Verificar DB:
```sql
SELECT * FROM commissions WHERE user_id = <id_usuario>;
SELECT aff_quota, aff_history_quota FROM users WHERE id = <id_inviter>;
```

### Test dashboard
1. Abrir `https://resuelve-api-affiliate-dash.onrender.com/dashboard.html`
2. Login con email del afiliado
3. Verificar stats

### Test admin
1. Abrir `https://resuelve-api-affiliate-dash.onrender.com/admin.html`
2. Login con token admin (JWT de usuario admin)
3. Marcar comisión como pagada
4. Verificar en DB: `SELECT status FROM commissions WHERE id=X`

## 9. Dominio Personalizado (Opcional)

### Render Custom Domain
1. Render Dashboard → Settings → Custom Domains
2. Agregar: `afiliados.resuelve-api.lat`
3. DNS: `CNAME afiliados resuelve-api-affiliate.onrender.com`

Actualizar URLs en HTML a `https://afiliados.resuelve-api.lat/api`

## 10. Monitoreo

```bash
# Logs API
Render Dashboard → Service → Logs

# Verificar health
curl https://resuelve-api-affiliate.onrender.com/health

# Ver comisiones pendientes
psql $DATABASE_URL -c "SELECT COUNT(*), SUM(amount) FROM commissions WHERE status='pending';"
```

## 11. Seguridad

- [ ] Cambiar `JWT_SECRET` a valor aleatorio fuerte
- [ ] Cambiar `WEBHOOK_SECRET` a valor aleatorio
- [ ] Configurar CORS restrictivo en producción
- [ ] Usar HTTPS obligatorio
- [ ] Rate limiting activo en endpoints críticos

## 12. Backup

```bash
# Backup semanal DB
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# O usar Render automated backups (plan pago)
```

## URLs Finales

- Dashboard Afiliado: `https://resuelve-api-affiliate-dash.onrender.com/dashboard.html`
- Admin Panel: `https://resuelve-api-affiliate-dash.onrender.com/admin.html`
- API Base: `https://resuelve-api-affiliate.onrender.com`
- Health Check: `https://resuelve-api-affiliate.onrender.com/health`

## Troubleshooting

### Error: "Invalid token"
- Verificar JWT_SECRET coincide entre API y frontend
- Token expirado (7 días) → re-login

### Error: "No inviter"
- Cookie no guardada → verificar tracker JS cargando
- Campo inviter_id no seteado en registro

### Comisión no se crea
- Verificar webhook secret
- Verificar logs New-API backend
- Verificar tabla commissions existe

### Dashboard no carga
- Verificar DATABASE_URL correcta
- Verificar CORS
- Verificar API_URL en HTML apunta a Render URL
