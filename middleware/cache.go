package middleware

import (
	"github.com/gin-gonic/gin"
)

func Cache() func(c *gin.Context) {
	return func(c *gin.Context) {
		path := c.Request.URL.Path

		// Never cache HTML files or root path
		if c.Request.RequestURI == "/" || strings.HasSuffix(path, ".html") {
			c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
			c.Header("Pragma", "no-cache")
			c.Header("Expires", "0")
		} else if strings.Contains(path, "/static/") ||
		          strings.Contains(path, "/dist/") {
			// Long cache for static assets
			c.Header("Cache-Control", "public, max-age=604800, immutable") // one week
		} else {
			// Default: short cache for other resources
			c.Header("Cache-Control", "public, max-age=300") // 5 minutes
		}
		c.Header("Cache-Version", "b688f2fb5be447c25e5aa3bd063087a83db32a288bf6a4f35f2d8db310e40b14")
		c.Next()
	}
}
