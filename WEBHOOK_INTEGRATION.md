# Ejemplo de integración webhook en topup handlers

## Opción 1: Helper reutilizable (recomendado)

Crear `common/affiliate.go`:

```go
package common

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/QuantumNous/new-api/logger"
)

type AffiliateWebhookPayload struct {
	UserID  int `json:"user_id"`
	Amount  int `json:"amount"`
	TopupID int `json:"topup_id"`
}

func TriggerAffiliateCommission(userID, amount, topupID int) {
	webhookURL := os.Getenv("AFFILIATE_WEBHOOK_URL")
	if webhookURL == "" {
		webhookURL = "https://resuelve-api-affiliate.onrender.com/api/webhook/topup"
	}

	webhookSecret := os.Getenv("WEBHOOK_SECRET")
	if webhookSecret == "" {
		logger.SysLog("WEBHOOK_SECRET not configured, skipping affiliate commission")
		return
	}

	payload := AffiliateWebhookPayload{
		UserID:  userID,
		Amount:  amount,
		TopupID: topupID,
	}

	go func() {
		jsonData, err := json.Marshal(payload)
		if err != nil {
			logger.SysLog("Affiliate webhook marshal error: " + err.Error())
			return
		}

		req, err := http.NewRequest("POST", webhookURL, bytes.NewBuffer(jsonData))
		if err != nil {
			logger.SysLog("Affiliate webhook request error: " + err.Error())
			return
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Webhook-Secret", webhookSecret)

		client := &http.Client{Timeout: 10 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			logger.SysLog("Affiliate webhook call error: " + err.Error())
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			logger.SysLog("Affiliate webhook returned non-200: " + resp.Status)
		}
	}()
}
```

## Opción 2: Integración directa

En cada controlador de topup (`controller/topup_stripe.go`, `topup_waffo_pancake.go`, etc.),
después de confirmar pago exitoso:

```go
// Ejemplo en topup_stripe.go después de incrementar quota

func handleStripeSuccess(userID int, amount int, topupID int) {
	// ... código existente que incrementa quota ...

	// Trigger affiliate commission
	common.TriggerAffiliateCommission(userID, amount, topupID)
}
```

## Puntos de integración por archivo

### controller/topup_stripe.go
Buscar: `IncreaseUserQuota` o línea similar donde se confirma pago
Agregar después: `common.TriggerAffiliateCommission(user.Id, quota, topup.Id)`

### controller/topup_waffo_pancake.go
Buscar: función que procesa webhook success de WaffoPancake
Agregar: `common.TriggerAffiliateCommission(userID, amount, topupID)`

### controller/topup_creem.go
Buscar: callback success
Agregar: `common.TriggerAffiliateCommission(user.Id, quota, topup.Id)`

## Variables de entorno necesarias

Agregar a `.env` o Render environment:

```bash
AFFILIATE_WEBHOOK_URL=https://resuelve-api-affiliate.onrender.com/api/webhook/topup
WEBHOOK_SECRET=tu_secreto_aleatorio_aqui
```

## Testing local

```bash
# Terminal 1: API affiliate
cd affiliate-api
DATABASE_URL="postgresql://..." WEBHOOK_SECRET="test123" python main.py

# Terminal 2: Simular recarga
curl -X POST http://localhost:8080/api/webhook/topup \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: test123" \
  -d '{"user_id": 2, "amount": 5000000, "topup_id": 1}'

# Verificar DB
psql $DATABASE_URL -c "SELECT * FROM commissions WHERE user_id=2;"
```

## Verificar en producción

```bash
# Logs New-API (Render)
# Buscar: "Affiliate commission processed"

# Logs API Affiliate
# Buscar: "Commission recorded"

# DB check
psql $DATABASE_URL -c "
SELECT u.username, c.amount, c.status, c.created_at
FROM commissions c
JOIN users u ON c.inviter_id = u.id
ORDER BY c.created_at DESC
LIMIT 10;
"
```
