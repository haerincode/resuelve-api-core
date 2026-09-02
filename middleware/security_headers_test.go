package middleware

import (
	"crypto/tls"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func securityHeaderResponse(t *testing.T, useTLS bool) http.Header {
	t.Helper()
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(SecurityHeaders())
	router.GET("/probe", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/probe", nil)
	if useTLS {
		request.TLS = &tls.ConnectionState{}
	}
	router.ServeHTTP(recorder, request)
	return recorder.Header()
}

func TestSecurityHeadersAlwaysSetTransportIndependentHeaders(t *testing.T) {
	header := securityHeaderResponse(t, false)

	assert.Equal(t, "nosniff", header.Get("X-Content-Type-Options"))
	assert.Equal(t, "SAMEORIGIN", header.Get("X-Frame-Options"))
	assert.Equal(t, "strict-origin-when-cross-origin", header.Get("Referrer-Policy"))
}

func TestSecurityHeadersOmitHSTSOnPlainHTTP(t *testing.T) {
	originalSecure := common.SessionCookieSecure
	t.Cleanup(func() { common.SessionCookieSecure = originalSecure })
	common.SessionCookieSecure = false

	header := securityHeaderResponse(t, false)

	assert.Empty(t, header.Get("Strict-Transport-Security"), "HSTS over plain HTTP would lock operators out of the dashboard")
}

func TestSecurityHeadersSetHSTSOnTLSRequest(t *testing.T) {
	originalSecure := common.SessionCookieSecure
	t.Cleanup(func() { common.SessionCookieSecure = originalSecure })
	common.SessionCookieSecure = false

	header := securityHeaderResponse(t, true)

	assert.Equal(t, "max-age=31536000", header.Get("Strict-Transport-Security"))
}

func TestSecurityHeadersSetHSTSWhenSecureCookieModeEnabled(t *testing.T) {
	originalSecure := common.SessionCookieSecure
	t.Cleanup(func() { common.SessionCookieSecure = originalSecure })
	common.SessionCookieSecure = true

	header := securityHeaderResponse(t, false)

	assert.Equal(t, "max-age=31536000", header.Get("Strict-Transport-Security"), "TLS-terminating proxies do not expose request.TLS to the app")
}
