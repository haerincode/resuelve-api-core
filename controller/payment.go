package controller

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
	"github.com/gin-gonic/gin"
)

var (
	flowService         *service.FlowService
	nowpaymentsService  *service.NOWPaymentsService
	usdtEnabled         bool
)

// InitPaymentServices initializes payment services with env vars
func InitPaymentServices(flowAPIKey, flowSecret, nowpayAPIKey, nowpayIPNSecret, callbackURL, returnURL, successURL, cancelURL string, usdt bool) {
	flowService = service.NewFlowService(flowAPIKey, flowSecret, callbackURL, returnURL)
	nowpaymentsService = service.NewNOWPaymentsService(nowpayAPIKey, nowpayIPNSecret, callbackURL, successURL, cancelURL)
	usdtEnabled = usdt
}

// PaymentHealth godoc
// @Summary Health check
// @Description Payment gateway status
// @Tags payment
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router / [get]
func PaymentHealth(c *gin.Context) {
	response := map[string]interface{}{
		"status":    "ok",
		"service":   "Resuelve-API Payment Gateway",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"endpoints": map[string]string{
			"payment_selector": "/submit.php",
			"flow_payment":     "/pay/flow",
			"flow_webhook":     "/api/flow/notify",
			"crypto_payment":   "/api/nowpayments/create",
			"crypto_webhook":   "/api/nowpayments/notify",
		},
		"features": map[string]bool{
			"webpay": true,
			"crypto": usdtEnabled,
		},
	}
	c.JSON(http.StatusOK, response)
}

// PaymentSelector godoc
// @Summary Payment method selector UI
// @Description Returns HTML form for payment method selection
// @Tags payment
// @Param money query float64 true "Amount in USD"
// @Param out_trade_no query string false "Order ID"
// @Param pid query string false "Product ID"
// @Param name query string false "Product name"
// @Produce html
// @Success 200
// @Router /submit.php [get]
// @Router /submit.php [post]
func PaymentSelector(c *gin.Context) {
	money := c.DefaultQuery("money", "10")
	outTradeNo := c.DefaultQuery("out_trade_no", fmt.Sprintf("RA-%d", time.Now().Unix()))
	pid := c.DefaultQuery("pid", "1000")
	name := c.DefaultQuery("name", "Recarga")

	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Seleccionar Método de Pago</title>
	<style>
		body { font-family: Arial; text-align: center; padding: 50px; }
		.container { max-width: 400px; margin: 0 auto; }
		button { padding: 15px 30px; margin: 10px; font-size: 16px; cursor: pointer; }
		.flow { background: #0066cc; color: white; }
		.crypto { background: #ffa500; color: white; }
	</style>
</head>
<body>
	<div class="container">
		<h1>Seleccionar Método de Pago</h1>
		<p>Monto: $%s USD</p>
		<form id="paymentForm">
			<input type="hidden" name="money" value="%s">
			<input type="hidden" name="out_trade_no" value="%s">
			<input type="hidden" name="pid" value="%s">
			<input type="hidden" name="name" value="%s">

			<button type="button" class="flow" onclick="submitFlow()">Pagar con Webpay (CLP)</button>
			<button type="button" class="crypto" onclick="submitCrypto()">Pagar con USDT (Crypto)</button>
		</form>
	</div>
	<script>
		function submitFlow() {
			const form = document.getElementById('paymentForm');
			form.action = '/pay/flow';
			form.method = 'POST';
			form.submit();
		}
		function submitCrypto() {
			const form = document.getElementById('paymentForm');
			form.action = '/api/nowpayments/create';
			form.method = 'POST';
			form.submit();
		}
	</script>
</body>
</html>
	`, money, money, outTradeNo, pid, name)

	c.Header("Content-Type", "text/html; charset=utf-8")
	c.String(http.StatusOK, html)
}

// InitiateFlowPayment godoc
// @Summary Initiate Flow payment
// @Description Create Flow payment and redirect to payment page
// @Tags payment
// @Param money formData float64 true "Amount in USD"
// @Param out_trade_no formData string false "Order ID"
// @Param email formData string false "Customer email"
// @Param name formData string false "Product name"
// @Produce json
// @Success 302
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /pay/flow [post]
func InitiateFlowPayment(c *gin.Context) {
	money := c.DefaultPostForm("money", "0")
	outTradeNo := c.DefaultPostForm("out_trade_no", fmt.Sprintf("RA-%d", time.Now().Unix()))
	email := c.DefaultPostForm("email", "user@resuelve-api.lat")
	name := c.DefaultPostForm("name", "Recarga")

	amountUSD, err := strconv.ParseFloat(money, 64)
	if err != nil || amountUSD <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount"})
		return
	}

	// Create payment record in DB
	payment := model.PaymentFlow{
		OrderID:    outTradeNo,
		UserID:     1, // TODO: Get from auth context
		AmountUSD:  amountUSD,
		AmountCLP:  amountUSD * 1000,
		Email:      email,
		Status:     "pending",
	}

	if err := model.DB.Create(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment record"})
		return
	}

	// Call Flow API
	flowURL, err := flowService.CreatePayment(outTradeNo, amountUSD, email, name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Redirect to Flow
	c.Redirect(http.StatusFound, flowURL)
}

// FlowWebhook godoc
// @Summary Flow payment webhook
// @Description Receives payment confirmation from Flow
// @Tags payment
// @Param token formData string true "Flow token"
// @Produce json
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/flow/notify [post]
func FlowWebhook(c *gin.Context) {
	token := c.PostForm("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token no provisto"})
		return
	}

	// Get payment status from Flow
	status, err := flowService.GetPaymentStatus(token)
	if err != nil {
		model.LogWebhook("flow", token, "", false, "", fmt.Sprintf("Status check error: %v", err))
		c.JSON(http.StatusOK, gin.H{"status": "error"})
		return
	}

	// Find payment record
	payment, err := model.GetPaymentFlowByOrderID(status.CommerceOrder)
	if err != nil {
		model.LogWebhook("flow", status.CommerceOrder, "", false, "", "Payment not found")
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
		return
	}

	// Log webhook
	payloadJSON, _ := json.Marshal(status)
	model.LogWebhook("flow", status.CommerceOrder, "", true, string(payloadJSON), status.PaymentNetwork)

	// Check if successful
	if flowService.IsPaymentSuccessful(status) {
		payment.Status = "success"
		payment.FlowToken = token
		payment.FlowOrder = status.FlowOrder
		payment.CreditsApplied = true
		now := time.Now()
		payment.CreditsAppliedAt = &now

		// TODO: Credit user balance in separate service
		// err = CreditUserBalance(payment.UserID, payment.AmountUSD)
		// if err != nil {
		//     LOG error
		// }

		model.DB.Save(payment)
	} else {
		payment.Status = "failed"
		model.DB.Save(payment)
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// InitiateNOWPaymentsPayment godoc
// @Summary Initiate NOWPayments invoice
// @Description Create NOWPayments invoice for crypto purchase
// @Tags payment
// @Param money formData float64 true "Amount in USD"
// @Param out_trade_no formData string false "Order ID"
// @Param email formData string false "Customer email"
// @Param crypto formData string false "Cryptocurrency (default: usdttrc20)"
// @Produce json
// @Success 302
// @Failure 400 {object} map[string]string
// @Failure 503 {object} map[string]string
// @Router /api/nowpayments/create [post]
func InitiateNOWPaymentsPayment(c *gin.Context) {
	if !usdtEnabled {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "El pago con USDT no está disponible en este momento. Usa Webpay o escríbenos a pagos@resuelve-api.lat",
		})
		return
	}

	money := c.DefaultPostForm("money", "0")
	outTradeNo := c.DefaultPostForm("out_trade_no", fmt.Sprintf("RA-%d", time.Now().Unix()))
	email := c.DefaultPostForm("email", "user@resuelve-api.lat")
	crypto := c.DefaultPostForm("crypto", "usdttrc20")

	amountUSD, err := strconv.ParseFloat(money, 64)
	if err != nil || amountUSD <= 0 || !isFinite(amountUSD) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Monto inválido"})
		return
	}

	// Create payment record
	payment := model.PaymentNOWPayments{
		OrderID:   outTradeNo,
		UserID:    1, // TODO: Get from auth context
		AmountUSD: amountUSD,
		Email:     email,
		Crypto:    crypto,
		Status:    "pending",
	}

	if err := model.DB.Create(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment record"})
		return
	}

	// Call NOWPayments API
	invoice, err := nowpaymentsService.CreateInvoice(outTradeNo, amountUSD, email, fmt.Sprintf("Recarga Resuelve-API $%.2f USD", amountUSD), crypto)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "No se pudo generar la factura de pago. Intenta con Webpay.",
		})
		return
	}

	// Redirect to NOWPayments
	c.Redirect(http.StatusFound, invoice.InvoiceURL)
}

// NOWPaymentsWebhook godoc
// @Summary NOWPayments webhook
// @Description Receives payment confirmation from NOWPayments
// @Tags payment
// @Produce json
// @Success 200 {string} string "OK"
// @Failure 401 {string} string "Signature invalid"
// @Router /api/nowpayments/notify [post]
func NOWPaymentsWebhook(c *gin.Context) {
	if !usdtEnabled {
		c.String(http.StatusServiceUnavailable, "USDT no configurado")
		return
	}

	// Get signature from header
	signature := c.GetHeader("x-nowpayments-sig")
	if signature == "" {
		c.String(http.StatusUnauthorized, "Firma ausente")
		return
	}

	// Read body
	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.String(http.StatusBadRequest, "OK")
		return
	}

	// Parse webhook payload
	var payload map[string]interface{}
	if err := json.Unmarshal(bodyBytes, &payload); err != nil {
		c.String(http.StatusOK, "OK")
		return
	}

	// Verify signature
	if !nowpaymentsService.VerifyIPN(payload, signature) {
		model.LogWebhook("nowpayments", "", signature, false, string(bodyBytes), "invalid_signature")
		c.String(http.StatusUnauthorized, "Firma inválida")
		return
	}

	// Parse into struct
	webhookData, err := nowpaymentsService.ParseWebhookPayload(bodyBytes)
	if err != nil {
		c.String(http.StatusOK, "OK")
		return
	}

	// Log webhook
	model.LogWebhook("nowpayments", webhookData.OrderID, signature, true, string(bodyBytes), webhookData.PaymentStatus)

	// Find payment
	payment, err := model.GetPaymentNOWPaymentsByOrderID(webhookData.OrderID)
	if err != nil {
		c.String(http.StatusOK, "OK")
		return
	}

	// Handle payment status
	if nowpaymentsService.IsPaymentConfirmed(webhookData.PaymentStatus) {
		// Check for partial payment
		if webhookData.ActuallyPaid < webhookData.PriceAmount*0.99 { // Allow 1% variance
			payment.Status = "partial"
			model.DB.Save(payment)
			c.String(http.StatusOK, "OK")
			return
		}

		payment.Status = "confirmed"
		payment.CreditsApplied = true
		now := time.Now()
		payment.CreditsAppliedAt = &now

		// TODO: Credit user balance
		// err = CreditUserBalance(payment.UserID, payment.AmountUSD)

		model.DB.Save(payment)
	} else if nowpaymentsService.IsPaymentFailed(webhookData.PaymentStatus) {
		payment.Status = "failed"
		model.DB.Save(payment)
	}

	c.String(http.StatusOK, "OK")
}

// Helper function to check if float is finite
func isFinite(f float64) bool {
	return f == f && f > -1e308 && f < 1e308
}
