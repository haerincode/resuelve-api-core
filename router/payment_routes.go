package router

import (
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/middleware"
	"github.com/gin-gonic/gin"
)

func SetPaymentRouter(router *gin.Engine) {
	// Public payment endpoints (no auth required)
	paymentRoute := router.Group("/")
	paymentRoute.Use(middleware.CORS())
	paymentRoute.Use(middleware.GlobalWebRateLimit())
	{
		// Health check - moved to /api/payment/health to not conflict with frontend
		paymentRoute.GET("/api/payment/health", controller.PaymentHealth)

		// Payment UI
		paymentRoute.GET("/submit.php", controller.PaymentSelector)
		paymentRoute.POST("/submit.php", controller.PaymentSelector)

		// Flow payment
		paymentRoute.GET("/pay/flow", controller.InitiateFlowPayment)
		paymentRoute.POST("/pay/flow", controller.InitiateFlowPayment)

		// Flow webhook (unauthenticated)
		paymentRoute.POST("/api/flow/notify", controller.FlowWebhook)

		// NOWPayments payment
		paymentRoute.GET("/api/nowpayments/create", controller.InitiateNOWPaymentsPayment)
		paymentRoute.POST("/api/nowpayments/create", controller.InitiateNOWPaymentsPayment)

		// NOWPayments webhook (unauthenticated)
		paymentRoute.POST("/api/nowpayments/notify", controller.NOWPaymentsWebhook)
	}
}
