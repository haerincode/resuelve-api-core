package controller

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
	"github.com/gin-gonic/gin"
)

var (
	flowService         *service.FlowService
	nowpaymentsService  *service.NOWPaymentsService
	lemonSqueezyService *service.LemonSqueezyService
	usdtEnabled         bool
	lemonSqueezyEnabled bool
)

// InitPaymentServices initializes payment services with env vars
func InitPaymentServices(flowAPIKey, flowSecret, nowpayAPIKey, nowpayIPNSecret, callbackURL, returnURL, successURL, cancelURL string, usdt bool) {
	flowService = service.NewFlowService(flowAPIKey, flowSecret, callbackURL, returnURL)
	nowpaymentsService = service.NewNOWPaymentsService(nowpayAPIKey, nowpayIPNSecret, callbackURL, successURL, cancelURL)
	usdtEnabled = usdt
}

// InitLemonSqueezy initializes Lemon Squeezy payment service
func InitLemonSqueezy(apiKey, signingSecret, storeID, variantID string) {
	logger.SysLog(fmt.Sprintf("InitLemonSqueezy called with: apiKey=%s, secret=%s, storeID=%s, variantID=%s",
		apiKey != "", signingSecret != "", storeID, variantID))

	if apiKey != "" && signingSecret != "" && storeID != "" && variantID != "" {
		lemonSqueezyService = service.NewLemonSqueezyService(apiKey, signingSecret, storeID, variantID)
		lemonSqueezyEnabled = true
		logger.SysLog("LemonSqueezy service initialized successfully")
	} else {
		logger.SysLog("LemonSqueezy NOT initialized - missing config")
	}
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
			"payment_selector":   "/submit.php",
			"flow_payment":       "/pay/flow",
			"flow_webhook":       "/api/flow/notify",
			"crypto_payment":     "/api/nowpayments/create",
			"crypto_webhook":     "/api/nowpayments/notify",
			"lemonsqueezy_webhook": "/api/lemonsqueezy/notify",
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
	userID := c.DefaultQuery("user_id", "1")

	// Log Lemon Squeezy status for debugging
	logger.LogInfo(c.Request.Context(), fmt.Sprintf("LemonSqueezy enabled: %v, service: %v", lemonSqueezyEnabled, lemonSqueezyService != nil))

	usdtStatus := "false"
	if usdtEnabled {
		usdtStatus = "true"
	}

	lemonSqueezyStatus := "false"
	lemonSqueezyDisplay := "display: none;"
	lemonSqueezyBadge := ""
	cryptoDividerDisplay := "display: none;"
	if lemonSqueezyEnabled {
		lemonSqueezyStatus = "true"
		lemonSqueezyDisplay = ""
		cryptoDividerDisplay = ""
	}

	cryptoDisplay := "display: none;"
	cryptoBadge := getCryptoBadge(usdtEnabled)
	cryptoSubtitle := getCryptoSubtitle(usdtEnabled)
	if usdtEnabled {
		cryptoDisplay = ""
		cryptoDividerDisplay = ""
	}

	html := fmt.Sprintf(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Método de Pago — Resuelve-API</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #0f0f0f;
      color: #e5e7eb;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .card {
      background: #ffffff;
      padding: 56px 40px 48px;
      border-radius: 16px;
      width: 100%%;
      max-width: 480px;
      box-shadow:
        0 0 0 1px rgba(0,0,0,0.04),
        0 2px 4px rgba(0,0,0,0.04),
        0 8px 16px rgba(0,0,0,0.04),
        0 16px 48px rgba(0,0,0,0.08);
      position: relative;
      animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 32px;
      border-bottom: 1px solid #e5e7eb;
    }

    .logo {
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.5px;
      color: #111827;
      margin-bottom: 20px;
      opacity: 0.95;
    }

    .amount {
      font-size: 56px;
      font-weight: 600;
      margin: 16px 0 12px;
      color: #111827;
      letter-spacing: -2px;
      line-height: 1;
    }

    .subtitle {
      color: #6b7280;
      font-size: 15px;
      font-weight: 400;
      line-height: 1.5;
    }

    .email-section {
      margin-bottom: 32px;
      position: relative;
    }

    .email-section label {
      display: block;
      font-size: 14px;
      color: #374151;
      margin-bottom: 8px;
      font-weight: 500;
      letter-spacing: -0.01em;
    }

    .email-section input {
      width: 100%%;
      padding: 13px 16px;
      background: #ffffff;
      border: 1.5px solid #d1d5db;
      border-radius: 6px;
      color: #111827;
      font-size: 16px;
      outline: none;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }

    .email-section input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), 0 1px 2px rgba(0,0,0,0.02);
    }

    .email-section.error input {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .email-section input::placeholder {
      color: #9ca3af;
    }

    .error-message {
      display: none;
      color: #dc2626;
      font-size: 13px;
      margin-top: 8px;
      font-weight: 400;
      line-height: 1.4;
    }

    .email-section.error .error-message {
      display: block;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .payment-methods {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 32px;
    }

    .payment-option {
      background: #ffffff;
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px 22px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .payment-option::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.03), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .payment-option::after {
      content: "→";
      position: absolute;
      right: 22px;
      top: 50%%;
      transform: translateY(-50%%) translateX(-8px);
      font-size: 22px;
      color: #9ca3af;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
    }

    .payment-option:hover {
      border-color: #6366f1;
      box-shadow:
        0 0 0 1px #6366f1,
        0 4px 12px rgba(99, 102, 241, 0.1),
        0 2px 4px rgba(0,0,0,0.02);
      transform: translateY(-1px);
    }

    .payment-option:hover::before {
      opacity: 1;
    }

    .payment-option:hover::after {
      opacity: 1;
      transform: translateY(-50%%) translateX(0);
      color: #6366f1;
    }

    .payment-option:active {
      transform: translateY(0);
      box-shadow:
        0 0 0 1px #6366f1,
        0 2px 4px rgba(99, 102, 241, 0.1);
    }

    .payment-option.clp:hover {
      border-color: #f59e0b;
      box-shadow:
        0 0 0 1px #f59e0b,
        0 4px 12px rgba(245, 158, 11, 0.12),
        0 2px 4px rgba(0,0,0,0.02);
    }

    .payment-option.clp:hover::after {
      color: #f59e0b;
    }

    .payment-option.usdt:hover {
      border-color: #10b981;
      box-shadow:
        0 0 0 1px #10b981,
        0 4px 12px rgba(16, 185, 129, 0.12),
        0 2px 4px rgba(0,0,0,0.02);
    }

    .payment-option.usdt:hover::after {
      color: #10b981;
    }

    .payment-icon {
      display: inline-block;
      font-size: 22px;
      margin-right: 12px;
      vertical-align: middle;
      filter: grayscale(0.2);
    }

    .payment-title {
      font-weight: 600;
      font-size: 16px;
      color: #111827;
      margin-bottom: 6px;
      letter-spacing: -0.3px;
      line-height: 1.4;
    }

    .payment-subtitle {
      font-size: 14px;
      color: #6b7280;
      font-weight: 400;
      line-height: 1.4;
    }

    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
      margin: 24px 0;
      font-weight: 500;
      letter-spacing: 0.02em;
    }

    .divider::before,
    .divider::after {
      content: "";
      flex: 1;
      border-bottom: 1px solid #e5e7eb;
    }

    .divider span {
      padding: 0 20px;
      text-transform: lowercase;
    }

    .crypto-notice {
      display: none;
      margin-top: 14px;
      background: #fffbeb;
      border: 1.5px solid #fcd34d;
      border-radius: 8px;
      padding: 16px 18px;
      animation: fadeIn 0.2s ease;
    }

    .crypto-notice.show { display: block; }

    .crypto-notice h4 {
      margin: 0 0 10px;
      font-size: 14px;
      font-weight: 700;
      color: #92400e;
      letter-spacing: -0.2px;
    }

    .crypto-notice ul {
      margin: 0 0 14px;
      padding-left: 18px;
      font-size: 13px;
      color: #78350f;
      line-height: 1.65;
    }

    .crypto-notice li { margin-bottom: 6px; }

    .crypto-notice strong { font-weight: 700; }

    .crypto-notice .cn-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .cn-btn {
      flex: 1 1 auto;
      padding: 11px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      border: 1.5px solid transparent;
      transition: all 0.15s;
    }

    .cn-btn.go {
      background: #10b981;
      border-color: #10b981;
      color: #fff;
    }

    .cn-btn.go:hover { background: #059669; border-color: #059669; }

    .cn-btn.cancel {
      background: #fff;
      border-color: #d1d5db;
      color: #374151;
    }

    .cn-btn.cancel:hover { border-color: #9ca3af; }

    .footer {
      text-align: center;
      margin-top: 32px;
      font-size: 13px;
      color: #9ca3af;
      font-weight: 400;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      line-height: 1.5;
    }

    .trust-badges {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 20px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
      flex-wrap: wrap;
    }

    .trust-badges img {
      height: 28px;
      opacity: 0.7;
      filter: grayscale(0.3);
      transition: all 0.2s;
    }

    .trust-badges img:hover {
      opacity: 1;
      filter: grayscale(0);
    }

    .support-text {
      font-size: 12px;
      color: #6b7280;
      margin-top: 16px;
      line-height: 1.6;
    }

    .support-text a {
      color: #6366f1;
      text-decoration: none;
      font-weight: 500;
    }

    .support-text a:hover {
      text-decoration: underline;
    }

    .privacy-note {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 12px;
      line-height: 1.5;
    }

    @media (max-width: 480px) {
      .card {
        padding: 40px 28px 36px;
      }

      .amount {
        font-size: 48px;
      }

      .trust-badges {
        gap: 12px;
      }

      .trust-badges img {
        height: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">Resuelve-API</div>
      <div class="amount">$%s</div>
      <div class="subtitle">Recarga tu cuenta con tokens de IA</div>
    </div>

    <div class="email-section" id="emailSection">
      <label>Correo electrónico</label>
      <input
        type="email"
        id="clientEmail"
        placeholder="tu-correo@ejemplo.com"
        autocomplete="email"
        spellcheck="false"
      />
      <div class="error-message" id="errorMessage">
        Ingresa un correo electrónico válido
      </div>
      <div class="privacy-note">Tu correo solo se usa para confirmar el pago. No compartimos tu información.</div>
    </div>

    <div class="payment-methods">
      <div class="payment-option clp" onclick="pagarClp()">
        <div class="payment-title"><span class="payment-icon">💳</span>Pagar con Webpay</div>
        <div class="payment-subtitle">Tarjetas de crédito/débito, Cuenta RUT • Acepta Visa y Mastercard (incluye internacionales con 3DS)</div>
      </div>

      <div class="divider"><span>o</span></div>

      <div class="payment-option" onclick="pagarLemonSqueezy()" id="lemonSqueezyOption" style="%s">
        <div class="payment-title"><span class="payment-icon">🌎</span>Pagar con tarjeta internacional%s</div>
        <div class="payment-subtitle">Visa, Mastercard, American Express • Pagos en USD con cualquier tarjeta del mundo</div>
      </div>

      <div class="divider" id="cryptoDivider" style="%s"><span>o</span></div>

      <div class="payment-option usdt" onclick="pagarUsdt()" id="cryptoOption" style="%s">
        <div class="payment-title"><span class="payment-icon">💵</span>Pagar con criptomonedas%s</div>
        <div class="payment-subtitle">USDT, USDC y más%s</div>
      </div>

      <div class="crypto-notice" id="cryptoNotice">
        <h4>Antes de continuar, lee esto</h4>
        <ul>
          <li><strong>Envía el monto exacto</strong> que te indique la pantalla de pago. Si envías menos, tu recarga queda como pago parcial y no se acredita automáticamente.</li>
          <li><strong>Las comisiones de red las paga quien envía.</strong> En tu billetera, descuenta el fee del saldo, no del monto a enviar.</li>
          <li><strong>Usa la red exacta</strong> que muestra la pantalla (TRC20, Polygon, etc.). Enviar por otra red pierde los fondos de forma irreversible.</li>
          <li>Tienes un tiempo limitado para completar el envío antes de que la cotización expire.</li>
          <li>Si algo sale distinto, escríbenos a <strong>pagos@resuelve-api.lat</strong> con tu comprobante y lo resolvemos a mano.</li>
        </ul>
        <div class="cn-actions">
          <button type="button" class="cn-btn go" onclick="confirmarCripto()">Entendido, continuar</button>
          <button type="button" class="cn-btn cancel" onclick="cancelarCripto()">Cancelar</button>
        </div>
      </div>
    </div>

    <div class="trust-badges">
      <img src="https://cdn.worldvectorlogo.com/logos/visa-10.svg" alt="Visa">
      <img src="https://cdn.worldvectorlogo.com/logos/mastercard-6.svg" alt="Mastercard">
    </div>

    <div class="footer">
      Acreditación instantánea
      <div class="support-text">
        ¿Problemas con tu pago? Escríbenos a <a href="mailto:pagos@resuelve-api.lat">pagos@resuelve-api.lat</a>
      </div>
    </div>
  </div>

  <script>
    const USDT_ENABLED = %s;
    const LEMONSQUEEZY_ENABLED = %s;
    const emailInput = document.getElementById('clientEmail');
    const emailSection = document.getElementById('emailSection');
    const errorMessage = document.getElementById('errorMessage');

    function validateEmail(email) {
      return email.includes('@') && email.includes('.');
    }

    function showError(message) {
      emailSection.classList.add('error');
      errorMessage.textContent = message;
      emailInput.focus();
    }

    function getValidatedEmail() {
      const email = emailInput.value.trim();

      if (!email) {
        showError('El correo electrónico es obligatorio');
        return null;
      }

      if (!validateEmail(email)) {
        showError('Ingresa un correo válido con @ y dominio');
        return null;
      }

      return email;
    }

    function pagarClp() {
      const email = getValidatedEmail();
      if (!email) return;

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/pay/flow';

      const fields = {
        money: '%s',
        out_trade_no: '%s',
        pid: '%s',
        name: '%s',
        email: email
      };

      for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    }

    function pagarLemonSqueezy() {
      if (!LEMONSQUEEZY_ENABLED) return;

      const email = getValidatedEmail();
      if (!email) return;

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/pay/lemonsqueezy';

      const fields = {
        money: '%s',
        out_trade_no: '%s',
        pid: '%s',
        name: '%s',
        email: email,
        user_id: '%s'
      };

      for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    }

    function pagarUsdt() {
      if (!USDT_ENABLED) return;

      const email = getValidatedEmail();
      if (!email) return;

      const notice = document.getElementById('cryptoNotice');
      if (notice && !notice.classList.contains('show')) {
        notice.classList.add('show');
        notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }
      confirmarCripto();
    }

    function confirmarCripto() {
      const email = getValidatedEmail();
      if (!email) return;

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/nowpayments/create';

      const fields = {
        money: '%s',
        out_trade_no: '%s',
        pid: '%s',
        name: '%s',
        email: email
      };

      for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    }

    function cancelarCripto() {
      const notice = document.getElementById('cryptoNotice');
      if (notice) notice.classList.remove('show');
    }

    emailInput.focus();

    emailInput.addEventListener('input', () => {
      emailSection.classList.remove('error');
    });

    emailInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        pagarClp();
      }
    });

    // Auto-submit based on method parameter
    const urlParams = new URLSearchParams(window.location.search);
    const method = urlParams.get('method');
    if (method === 'crypto' && USDT_ENABLED) {
      setTimeout(() => pagarUsdt(), 500);
    } else if (method === 'webpay') {
      setTimeout(() => pagarClp(), 500);
    }
  </script>
</body>
</html>`,
		lemonSqueezyDisplay, lemonSqueezyBadge,
		cryptoDividerDisplay,
		cryptoDisplay, cryptoBadge, cryptoSubtitle,
		usdtStatus, lemonSqueezyStatus,
		money, outTradeNo, pid, name,
		money, outTradeNo, pid, name, userID,
		money, outTradeNo, pid, name)

	c.Header("Content-Type", "text/html; charset=utf-8")
	c.String(http.StatusOK, html)
}

func getCryptoStyle(enabled bool) string {
	if enabled {
		return ""
	}
	return "opacity: 0.5; cursor: not-allowed;"
}

func getCryptoBadge(enabled bool) string {
	if enabled {
		return ""
	}
	return ` <span style="font-size: 12px; background: #374151; color: #e5e7eb; padding: 2px 8px; border-radius: 4px; margin-left: 8px;">Próximamente</span>`
}

func getCryptoSubtitle(enabled bool) string {
	if enabled {
		return " • Eliges la moneda y la red al pagar • Acreditación automática"
	}
	return ""
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
	email := c.DefaultPostForm("email", "contacto@resuelve-api.lat")
	name := c.DefaultPostForm("name", "Recarga")

	amountUSD, err := strconv.ParseFloat(money, 64)
	if err != nil || amountUSD <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount"})
		return
	}

	// Validate email
	if email == "" {
		email = "contacto@resuelve-api.lat"
	}

	// Call Flow API directly (DB record created on webhook confirmation)
	flowURL, err := flowService.CreatePayment(outTradeNo, amountUSD, email, name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Redirect to Flow
	c.Redirect(http.StatusFound, flowURL)
}

// InitiateLemonSqueezyPayment godoc
// @Summary Initiate Lemon Squeezy payment
// @Description Create Lemon Squeezy checkout and redirect to payment page
// @Tags payment
// @Param money formData float64 true "Amount in USD"
// @Param out_trade_no formData string false "Order ID"
// @Param email formData string false "Customer email"
// @Param user_id formData int true "User ID"
// @Produce json
// @Success 302
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /pay/lemonsqueezy [post]
func InitiateLemonSqueezyPayment(c *gin.Context) {
	if lemonSqueezyService == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Lemon Squeezy not configured"})
		return
	}

	money := c.DefaultPostForm("money", "0")
	outTradeNo := c.DefaultPostForm("out_trade_no", fmt.Sprintf("LS-%d", time.Now().Unix()))
	email := c.DefaultPostForm("email", "")
	userIDStr := c.PostForm("user_id")

	amountUSD, err := strconv.ParseFloat(money, 64)
	if err != nil || amountUSD <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount"})
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil || userID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id"})
		return
	}

	// Create checkout with Lemon Squeezy
	checkout, err := lemonSqueezyService.CreateCheckout(amountUSD, email, userID, outTradeNo)
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("Lemon Squeezy checkout failed: %v", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create checkout"})
		return
	}

	// Redirect to Lemon Squeezy checkout
	c.Redirect(http.StatusFound, checkout.Data.Attributes.URL)
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

	// Log webhook
	payloadJSON, _ := json.Marshal(status)
	model.LogWebhook("flow", status.CommerceOrder, "", true, string(payloadJSON), status.PaymentNetwork)

	// Check if successful
	if !flowService.IsPaymentSuccessful(status) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
		return
	}

	// Use unified TopUp recharge system instead of legacy PaymentFlow
	tradeNo := status.CommerceOrder
	alreadyDone, err := model.RechargeEpay(tradeNo, "", c.ClientIP())
	if err != nil {
		if errors.Is(err, model.ErrTopUpNotFound) {
			// Order doesn't exist in TopUp table, might be old PaymentFlow record
			payment, err := model.GetPaymentFlowByOrderID(status.CommerceOrder)
			if err != nil {
				logger.LogError(c.Request.Context(), fmt.Sprintf("Flow webhook order not found trade_no=%s error=%q", tradeNo, err.Error()))
				c.JSON(http.StatusOK, gin.H{"status": "ok"})
				return
			}

			// Update legacy record only
			payment.Status = "success"
			payment.FlowToken = token
			payment.FlowOrder = status.FlowOrder
			payment.CreditsApplied = true
			now := time.Now()
			payment.CreditsAppliedAt = &now
			model.DB.Save(payment)

			logger.LogWarn(c.Request.Context(), fmt.Sprintf("Flow webhook found legacy PaymentFlow record, no credits added trade_no=%s", tradeNo))
		} else {
			logger.LogError(c.Request.Context(), fmt.Sprintf("Flow webhook recharge failed trade_no=%s error=%q", tradeNo, err.Error()))
		}
	} else if alreadyDone {
		logger.LogInfo(c.Request.Context(), fmt.Sprintf("Flow webhook duplicate callback trade_no=%s", tradeNo))
	} else {
		logger.LogInfo(c.Request.Context(), fmt.Sprintf("Flow webhook recharge success trade_no=%s", tradeNo))
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

	// Read body
	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		model.LogWebhook("nowpayments", "", "", false, "", "Body read error")
		c.String(http.StatusBadRequest, "Invalid request")
		return
	}

	// Parse JSON
	var webhookData struct {
		OrderID       string  `json:"order_id"`
		PaymentID     string  `json:"payment_id"`
		PaymentStatus string  `json:"payment_status"`
		PriceAmount   float64 `json:"price_amount"`
		ActuallyPaid  float64 `json:"actually_paid"`
	}
	if err := json.Unmarshal(bodyBytes, &webhookData); err != nil {
		model.LogWebhook("nowpayments", "", "", false, "", "JSON parse error")
		c.String(http.StatusBadRequest, "Invalid JSON")
		return
	}

	// Verify signature
	sig := c.GetHeader("x-nowpayments-sig")
	var bodyMap map[string]interface{}
	json.Unmarshal(bodyBytes, &bodyMap)
	if !model.VerifyNOWPaymentsSignature(bodyMap, sig, nowpaymentsService.IPNSecret) {
		model.LogWebhook("nowpayments", webhookData.OrderID, sig, false, string(bodyBytes), webhookData.PaymentStatus)
		c.String(http.StatusUnauthorized, "Signature invalid")
		return
	}

	// Log webhook
	model.LogWebhook("nowpayments", webhookData.OrderID, sig, true, string(bodyBytes), webhookData.PaymentStatus)

	// Check if payment confirmed
	if !nowpaymentsService.IsPaymentConfirmed(webhookData.PaymentStatus) {
		c.String(http.StatusOK, "OK")
		return
	}

	// Check for partial payment
	if webhookData.ActuallyPaid < webhookData.PriceAmount*0.99 { // Allow 1% variance
		logger.LogWarn(c.Request.Context(), fmt.Sprintf("NOWPayments partial payment order_id=%s expected=%.2f paid=%.2f", webhookData.OrderID, webhookData.PriceAmount, webhookData.ActuallyPaid))
		c.String(http.StatusOK, "OK")
		return
	}

	// Use unified TopUp recharge system
	tradeNo := webhookData.OrderID
	alreadyDone, err := model.RechargeEpay(tradeNo, "crypto", c.ClientIP())
	if err != nil {
		if errors.Is(err, model.ErrTopUpNotFound) {
			// Order doesn't exist in TopUp table, might be old PaymentNOWPayments record
			payment, err := model.GetPaymentNOWPaymentsByOrderID(webhookData.OrderID)
			if err != nil {
				logger.LogError(c.Request.Context(), fmt.Sprintf("NOWPayments webhook order not found trade_no=%s error=%q", tradeNo, err.Error()))
				c.String(http.StatusOK, "OK")
				return
			}

			// Update legacy record only
			payment.Status = "confirmed"
			payment.CreditsApplied = true
			now := time.Now()
			payment.CreditsAppliedAt = &now
			model.DB.Save(payment)

			logger.LogWarn(c.Request.Context(), fmt.Sprintf("NOWPayments webhook found legacy record, no credits added trade_no=%s", tradeNo))
		} else {
			logger.LogError(c.Request.Context(), fmt.Sprintf("NOWPayments webhook recharge failed trade_no=%s error=%q", tradeNo, err.Error()))
		}
	} else if alreadyDone {
		logger.LogInfo(c.Request.Context(), fmt.Sprintf("NOWPayments webhook duplicate callback trade_no=%s", tradeNo))
	} else {
		logger.LogInfo(c.Request.Context(), fmt.Sprintf("NOWPayments webhook recharge success trade_no=%s", tradeNo))
	}

	c.String(http.StatusOK, "OK")
}

// LemonSqueezyWebhook godoc
// @Summary Lemon Squeezy webhook
// @Description Handles Lemon Squeezy payment notifications
// @Tags payment
// @Accept json
// @Produce plain
// @Router /api/lemonsqueezy/notify [post]
func LemonSqueezyWebhook(c *gin.Context) {
	if lemonSqueezyService == nil {
		c.String(http.StatusServiceUnavailable, "Lemon Squeezy not configured")
		return
	}

	// Read raw body for signature verification
	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("Lemon Squeezy webhook failed to read body: %v", err))
		c.String(http.StatusBadRequest, "Bad Request")
		return
	}

	// Verify signature
	signature := c.GetHeader("X-Signature")
	if !lemonSqueezyService.VerifyWebhookSignature(bodyBytes, signature) {
		logger.LogError(c.Request.Context(), "Lemon Squeezy webhook invalid signature")
		model.LogWebhook("lemonsqueezy", "unknown", signature, false, string(bodyBytes), "invalid_signature")
		c.String(http.StatusUnauthorized, "Invalid signature")
		return
	}

	// Parse webhook payload
	var webhook service.LemonSqueezyWebhook
	if err := json.Unmarshal(bodyBytes, &webhook); err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("Lemon Squeezy webhook failed to parse: %v", err))
		c.String(http.StatusBadRequest, "Bad Request")
		return
	}

	// Log webhook
	orderID := webhook.Data.ID
	eventName := webhook.Meta.EventName
	model.LogWebhook("lemonsqueezy", orderID, signature, true, string(bodyBytes), eventName)

	// Only process order_created and subscription_payment_success events
	if eventName != "order_created" && eventName != "subscription_payment_success" {
		logger.LogInfo(c.Request.Context(), fmt.Sprintf("Lemon Squeezy webhook ignored event=%s order_id=%s", eventName, orderID))
		c.String(http.StatusOK, "OK")
		return
	}

	// Check if payment is confirmed
	status := webhook.Data.Attributes.Status
	if status != "paid" {
		logger.LogInfo(c.Request.Context(), fmt.Sprintf("Lemon Squeezy webhook payment not confirmed status=%s order_id=%s", status, orderID))
		c.String(http.StatusOK, "OK")
		return
	}

	// Process webhook and get trade_no
	tradeNo, err := lemonSqueezyService.ProcessWebhook(&webhook)
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("Lemon Squeezy webhook failed to process: %v", err))
		c.String(http.StatusBadRequest, "Bad Request")
		return
	}

	// Use unified TopUp recharge system
	alreadyDone, err := model.RechargeEpay(tradeNo, "lemonsqueezy", c.ClientIP())
	if err != nil {
		if errors.Is(err, model.ErrTopUpNotFound) {
			logger.LogError(c.Request.Context(), fmt.Sprintf("Lemon Squeezy webhook order not found trade_no=%s error=%q", tradeNo, err.Error()))
		} else {
			logger.LogError(c.Request.Context(), fmt.Sprintf("Lemon Squeezy webhook recharge failed trade_no=%s error=%q", tradeNo, err.Error()))
		}
	} else if alreadyDone {
		logger.LogInfo(c.Request.Context(), fmt.Sprintf("Lemon Squeezy webhook duplicate callback trade_no=%s", tradeNo))
	} else {
		logger.LogInfo(c.Request.Context(), fmt.Sprintf("Lemon Squeezy webhook recharge success trade_no=%s", tradeNo))
	}

	c.String(http.StatusOK, "OK")
}

// Helper function to check if float is finite
func isFinite(f float64) bool {
	return f == f && f > -1e308 && f < 1e308
}
