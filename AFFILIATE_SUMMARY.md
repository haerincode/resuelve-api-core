## Sistema de Afiliados - Resumen Ejecutivo

### ✅ Archivos Creados

```
resuelve-api-core/
├── affiliate_system.sql              # Schema PostgreSQL (tablas commissions, affiliates)
├── DEPLOYMENT_AFFILIATE.md           # Guía completa deployment
├── WEBHOOK_INTEGRATION.md            # Integración con New-API
├── deploy_affiliate.sh               # Script deployment automatizado
│
├── affiliate-api/
│   ├── main.py                       # FastAPI backend (login, dashboard, admin, webhook)
│   ├── requirements.txt              # Deps Python
│   ├── Procfile                      # Render config
│   ├── runtime.txt                   # Python 3.11
│   ├── dashboard.html                # UI afiliado (vanilla JS)
│   ├── admin.html                    # UI admin panel
│   ├── referral-tracker.js           # Script captura refs landing
│   ├── README.md                     # Docs sistema
│   └── .gitignore
│
└── controller/
    └── affiliate_webhook.go          # Webhook New-API (procesa comisiones)
```

### 🎯 Funcionalidad Implementada

**Captura Referidos:**
- Cookie 30 días `?ref=CODIGO`
- Auto-inject `inviter_id` registro
- Compatible con SPA (MutationObserver)

**Comisiones:**
- 30% automático post-recarga
- Tabla `commissions` detallada
- Stats `aff_quota`, `aff_history_quota`

**Dashboard Afiliado:**
- Login email/password
- Stats: pendiente, total, referidos
- Link compartible auto-generado
- Config wallet USDT TRC20
- Historial comisiones

**Admin Panel:**
- Ver todos afiliados + stats
- Comisiones pendientes
- Batch mark paid
- Export CSV pagos
- Stats globales

### 🚀 Deployment Rápido

**1. Base Datos:**
```bash
psql $DATABASE_URL < affiliate_system.sql
```

**2. Render Web Service:**
```
Root: affiliate-api
Build: pip install -r requirements.txt
Start: python main.py

Env:
DATABASE_URL=postgresql://...
JWT_SECRET=random32hex
WEBHOOK_SECRET=random32hex
COMMISSION_RATE=0.30
```

**3. Integrar New-API:**
- Agregar ruta webhook `router/api-router.go`
- Llamar `common.TriggerAffiliateCommission()` post-recarga
- Ver `WEBHOOK_INTEGRATION.md`

**4. Landing Page:**
```html
<script src="https://tu-static.onrender.com/referral-tracker.js"></script>
```

### 📊 Flujo Completo

1. Usuario → `resuelve-api.lat?ref=ABC123`
2. Cookie guardada 30 días
3. Registro → `inviter_id=X` seteado
4. Recarga $100 → webhook triggered
5. Comisión $30 creada (pending)
6. Afiliado ve pendiente dashboard
7. Admin marca paid → transfer USDT manual
8. Stats actualizadas

### 🔒 Seguridad

- JWT auth 7 días
- Webhook secret validation
- CORS configurado
- Rate limiting
- Admin role check
- Password hashing SHA256

### 📈 Ventajas vs Sistema Actual

**Sistema actual New-API:**
- Solo tracking básico (`aff_count`, `aff_quota`)
- Sin comisión automática
- Sin dashboard externo
- Sin tracking detallado

**Sistema nuevo:**
- ✅ Comisión automática post-recarga
- ✅ Dashboard standalone afiliado
- ✅ Admin panel pagos batch
- ✅ Tracking detallado tabla `commissions`
- ✅ Export CSV
- ✅ Wallet USDT config
- ✅ Cookie 30 días persistent

### 🛠 Próximos Pasos

1. **Deploy API:** Render Web Service (5 min)
2. **Deploy DB:** Run SQL script (2 min)
3. **Integrar webhook:** Editar topup handlers (10 min)
4. **Agregar tracker:** Landing page script tag (1 min)
5. **Test:** Captura + recarga + comisión (5 min)
6. **Producción:** Update URLs, custom domain opcional

**Tiempo total implementación: 2-3 horas**

### 📞 Testing Checklist

- [ ] Cookie captura `?ref=CODE`
- [ ] Registro setea `inviter_id`
- [ ] Recarga dispara webhook
- [ ] Comisión creada tabla `commissions`
- [ ] Stats afiliado actualizadas
- [ ] Dashboard login funciona
- [ ] Link compartible copia
- [ ] Admin ve comisiones pending
- [ ] Mark paid actualiza DB
- [ ] CSV export genera archivo

### 💡 Notas Importantes

- Sistema **independiente** del core New-API (no rompe nada existente)
- Compatible con sistema referidos actual (usa mismas columnas)
- Pagos USDT **manuales** (admin ve wallet, exporta CSV, transfiere externamente)
- Dashboard **read-only** para afiliados (solo admin marca pagado)
- API Python escalable (Render free tier OK hasta ~100 afiliados)

Ver `DEPLOYMENT_AFFILIATE.md` para instrucciones paso a paso detalladas.
