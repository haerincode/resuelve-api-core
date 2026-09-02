package router

import (
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/middleware"
	"github.com/gin-gonic/gin"
)

func SetAffiliateRouter(router *gin.Engine) {
	affiliateRoute := router.Group("/api/affiliate")
	affiliateRoute.Use(middleware.CORS())
	{
		// Public endpoints
		affiliateRoute.POST("/register", controller.RegisterAffiliate)
		affiliateRoute.POST("/login", controller.AffiliateLogin)

		// Protected endpoints (require JWT)
		affiliateRoute.Use(middleware.AffiliateAuth())
		affiliateRoute.GET("/dashboard", controller.GetAffiliateDashboard)
		affiliateRoute.GET("/commissions", controller.GetAffiliateCommissions)
		affiliateRoute.PUT("/wallet", controller.UpdateAffiliateWallet)

		// Admin endpoints
		adminRoute := affiliateRoute.Group("/admin")
		adminRoute.Use(middleware.AffiliateAdminAuth())
		{
			adminRoute.GET("/affiliates", controller.GetAllAffiliates)
			adminRoute.GET("/commissions/pending", controller.GetPendingCommissions)
			adminRoute.POST("/commissions/mark-paid", controller.MarkCommissionsPaid)
			adminRoute.GET("/export/pending", controller.ExportPendingCommissions)
		}
	}

	// Webhook endpoint (protected by secret)
	router.POST("/webhook/topup", middleware.WebhookAuth(), controller.HandleTopupWebhook)
}
