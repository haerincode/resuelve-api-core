package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AffiliateAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
			c.Abort()
			return
		}

		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			secret = "default-jwt-secret-change-in-production"
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		affiliateID, ok := claims["affiliate_id"].(float64)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid affiliate ID"})
			c.Abort()
			return
		}

		c.Set("affiliate_id", int(affiliateID))
		c.Next()
	}
}

func AffiliateAdminAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if user is admin via existing New-API auth
		userId := c.GetInt("id")
		if userId == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		user, err := model.GetUserById(userId, false)
		if err != nil || user.Role != common.RoleRootUser {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func WebhookAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		secret := c.GetHeader("X-Webhook-Secret")
		expectedSecret := os.Getenv("WEBHOOK_SECRET")

		if expectedSecret == "" {
			expectedSecret = "default-webhook-secret-change-in-production"
		}

		if secret != expectedSecret {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid webhook secret"})
			c.Abort()
			return
		}

		c.Next()
	}
}
