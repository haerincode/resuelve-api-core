package middleware

import (
	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
)

// SecurityHeaders sets response hardening headers that are safe for both the
// dashboard and the relay API.
//
// Content-Security-Policy is deliberately not set here: the dashboard injects
// inline analytics snippets into index.html, so a policy strict enough to be
// worth having must be authored together with those templates.
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.Writer.Header()
		header.Set("X-Content-Type-Options", "nosniff")
		header.Set("X-Frame-Options", "SAMEORIGIN")
		header.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		// HSTS is only meaningful over TLS, and sending it from a plain HTTP
		// deployment would lock operators out of their own dashboard. The
		// directive intentionally omits includeSubDomains so that sibling
		// subdomains still served over HTTP keep working.
		if c.Request.TLS != nil || common.SessionCookieSecure {
			header.Set("Strict-Transport-Security", "max-age=31536000")
		}
		c.Next()
	}
}
