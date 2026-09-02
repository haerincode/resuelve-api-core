package middleware

import (
	"github.com/QuantumNous/new-api/common"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	config := cors.DefaultConfig()
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"*"}
	if len(common.CORSAllowOrigins) > 0 {
		config.AllowOrigins = common.CORSAllowOrigins
		config.AllowCredentials = true
		return cors.New(config)
	}
	// Wildcard mode keeps browser-based relay clients working without operator
	// configuration. Credentials stay off because browsers already reject
	// `Access-Control-Allow-Origin: *` on credentialed requests: advertising
	// them only invites cross-site calls that look authenticated. Operators who
	// need cookie-bearing cross-origin calls set CORS_ALLOW_ORIGINS instead.
	config.AllowAllOrigins = true
	config.AllowCredentials = false
	return cors.New(config)
}

func Version() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-New-Api-Version", common.Version)
		c.Next()
	}
}
