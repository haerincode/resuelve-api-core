package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
)

// BotDetector detecta bots de payment processors y crawlers
func BotDetector() gin.HandlerFunc {
	// User-Agent patterns de payment processors y crawlers conocidos
	botPatterns := []string{
		"paddle",
		"stripe",
		"paypal",
		"googlebot",
		"bingbot",
		"slackbot",
		"twitterbot",
		"facebookexternalhit",
		"linkedinbot",
		"whatsapp",
		"telegrambot",
		"discordbot",
		"python-requests", // Common for payment verification
		"curl",
		"wget",
		"http.rb",         // Ruby HTTP client
		"Go-http-client",  // Go HTTP client
	}

	return func(c *gin.Context) {
		userAgent := strings.ToLower(c.GetHeader("User-Agent"))

		isBot := false
		for _, pattern := range botPatterns {
			if strings.Contains(userAgent, pattern) {
				isBot = true
				break
			}
		}

		// Set flag para que NoRoute sepa que servir
		if isBot {
			c.Set("is_bot", true)
		}

		c.Next()
	}
}
