package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func corsPreflightResponse(t *testing.T, origin string) *httptest.ResponseRecorder {
	t.Helper()
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(CORS())
	router.GET("/v1/models", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodOptions, "/v1/models", nil)
	request.Header.Set("Origin", origin)
	request.Header.Set("Access-Control-Request-Method", http.MethodGet)
	router.ServeHTTP(recorder, request)
	return recorder
}

func TestCORSWildcardModeNeverAdvertisesCredentials(t *testing.T) {
	originalOrigins := common.CORSAllowOrigins
	t.Cleanup(func() { common.CORSAllowOrigins = originalOrigins })
	common.CORSAllowOrigins = nil

	recorder := corsPreflightResponse(t, "https://attacker.example")

	assert.Equal(t, "*", recorder.Header().Get("Access-Control-Allow-Origin"))
	assert.Empty(t, recorder.Header().Get("Access-Control-Allow-Credentials"),
		"a wildcard origin must not claim to accept credentials")
}

func TestCORSAllowlistModeReflectsOnlyConfiguredOrigins(t *testing.T) {
	originalOrigins := common.CORSAllowOrigins
	t.Cleanup(func() { common.CORSAllowOrigins = originalOrigins })
	common.CORSAllowOrigins = []string{"https://dashboard.example"}

	allowed := corsPreflightResponse(t, "https://dashboard.example")
	assert.Equal(t, "https://dashboard.example", allowed.Header().Get("Access-Control-Allow-Origin"))
	assert.Equal(t, "true", allowed.Header().Get("Access-Control-Allow-Credentials"))

	rejected := corsPreflightResponse(t, "https://attacker.example")
	assert.Empty(t, rejected.Header().Get("Access-Control-Allow-Origin"),
		"an origin outside the allowlist must not be reflected")
}
