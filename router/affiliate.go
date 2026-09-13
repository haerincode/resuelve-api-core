package router

import (
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/middleware"
	"github.com/gin-gonic/gin"
)

func SetAffiliateRouter(router *gin.Engine) {
	affiliateRoute := router.Group("/api/affiliate")
	affiliateRoute.Use(middleware.CORS())
	affiliateRoute.Use(middleware.GlobalWebRateLimit())
	{
		// Public endpoints
		affiliateRoute.POST("/register", controller.RegisterAffiliate)
		affiliateRoute.POST("/login", controller.AffiliateLogin)

		// Protected endpoints - require main user authentication
		affiliateRoute.Use(middleware.UserAuth())
		affiliateRoute.Use(middleware.AffiliateAuth())
		affiliateRoute.GET("/dashboard", controller.GetAffiliateDashboard)
		affiliateRoute.GET("/dashboard/enhanced", controller.GetEnhancedDashboard)
		affiliateRoute.GET("/commissions", controller.GetAffiliateCommissions)
		affiliateRoute.PUT("/wallet", controller.UpdateAffiliateWallet)
		affiliateRoute.POST("/withdrawal/request", controller.RequestWithdrawal)
		affiliateRoute.GET("/withdrawal/history", controller.GetWithdrawalHistory)

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
}
