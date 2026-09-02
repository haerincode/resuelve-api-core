package middleware

import (
	"github.com/gin-gonic/gin"
	"strings"
)

// StaticAssetCache sets long cache headers for static assets
func StaticAssetCache() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		
		// 1 year cache for versioned assets (contain hash in filename)
		if strings.Contains(path, "/dist/static/") || 
		   strings.Contains(path, "/static/js/") ||
		   strings.Contains(path, "/static/css/") {
			c.Header("Cache-Control", "public, max-age=31536000, immutable")
		} else if strings.HasSuffix(path, ".png") || 
		          strings.HasSuffix(path, ".jpg") || 
		          strings.HasSuffix(path, ".jpeg") || 
		          strings.HasSuffix(path, ".webp") || 
		          strings.HasSuffix(path, ".svg") ||
		          strings.HasSuffix(path, ".woff2") ||
		          strings.HasSuffix(path, ".woff") {
			// 1 year for images and fonts
			c.Header("Cache-Control", "public, max-age=31536000, immutable")
		} else if strings.HasSuffix(path, ".html") {
			// No cache for HTML files
			c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
		}
		
		c.Next()
	}
}
