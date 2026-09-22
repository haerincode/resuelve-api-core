package router

import (
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/middleware"
	"github.com/gin-gonic/gin"
)

func SetPaymentRouter(router *gin.Engine) {
	// LEGACY PAYMENT ENDPOINTS - DEPRECATED
	// These use old PaymentFlow/PaymentNOWPayments models that don't integrate with TopUp system.
	// NEW PAYMENTS use /api/topup endpoints (controller/topup.go) which properly credit users.
	//
	// WARNING: These endpoints are kept for webhook compatibility ONLY.
	// DO NOT create new payments through these - all credits must go through RequestEpay().

	paymentRoute := router.Group("/")
	paymentRoute.Use(middleware.CORS())
	paymentRoute.Use(middleware.GlobalWebRateLimit())
	{
		// Health check
		paymentRoute.GET("/api/payment/health", controller.PaymentHealth)

		// DEPRECATED: Payment selector UI - do not use for new payments
		// Use /api/topup/request instead
		paymentRoute.GET("/submit.php", controller.PaymentSelector)
		paymentRoute.POST("/submit.php", controller.PaymentSelector)

		// DEPRECATED: Flow direct payment - creates PaymentFlow records (no TopUp integration)
		// Use RequestEpay() in topup.go instead
		paymentRoute.GET("/pay/flow", controller.InitiateFlowPayment)
		paymentRoute.POST("/pay/flow", controller.InitiateFlowPayment)

		// Lemon Squeezy payment - creates checkout and redirects
		paymentRoute.GET("/pay/lemonsqueezy", controller.InitiateLemonSqueezyPayment)
		paymentRoute.POST("/pay/lemonsqueezy", controller.InitiateLemonSqueezyPayment)

		// Flow webhook - NOW FIXED to call RechargeEpay() and credit user balance
		paymentRoute.POST("/api/flow/notify", controller.FlowWebhook)

		// DEPRECATED: NOWPayments direct payment - hardcoded UserID=1 bug
		// Use RequestEpay() in topup.go instead
		paymentRoute.GET("/api/nowpayments/create", controller.InitiateNOWPaymentsPayment)
		paymentRoute.POST("/api/nowpayments/create", controller.InitiateNOWPaymentsPayment)

		// NOWPayments webhook - NOW FIXED to call RechargeEpay() and credit user balance
		paymentRoute.POST("/api/nowpayments/notify", controller.NOWPaymentsWebhook)

		// Lemon Squeezy webhook - uses RechargeEpay() to credit user balance
		paymentRoute.POST("/api/lemonsqueezy/notify", controller.LemonSqueezyWebhook)
	}
}
