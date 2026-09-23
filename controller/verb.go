package controller

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

type VerbTokenClaims struct {
	Sub string `json:"sub"`
	Exp int64  `json:"exp"`
}

// GetVerbToken generates a short-lived token for Verb identity
// This allows the Verb widget to act as the signed-in user
func GetVerbToken(c *gin.Context) {
	userId := c.GetInt("id")
	if userId == 0 {
		// Not signed in - return null so Verb stays anonymous (read-only)
		c.JSON(http.StatusOK, gin.H{"token": nil})
		return
	}

	// Create claims with 15-minute expiration
	claims := VerbTokenClaims{
		Sub: fmt.Sprintf("%d", userId),
		Exp: time.Now().Unix() + 900, // 15 minutes
	}

	claimsJSON, err := json.Marshal(claims)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create token"})
		return
	}

	// Base64URL encode the claims (no padding)
	body := base64.RawURLEncoding.EncodeToString(claimsJSON)

	// Get signing key from environment
	signingKey := os.Getenv("VERB_SIGNING_KEY")
	if signingKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "VERB_SIGNING_KEY not configured"})
		return
	}

	// HMAC-SHA256 signature
	mac := hmac.New(sha256.New, []byte(signingKey))
	mac.Write([]byte(body))
	sig := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))

	// Join with dot: body.signature
	token := body + "." + sig
	c.JSON(http.StatusOK, gin.H{"token": token})
}
