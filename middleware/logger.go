package middleware

import (
	"fmt"
	"net/url"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
)

const RouteTagKey = "route_tag"

// credentialQueryKeys are query parameter names whose values authenticate a
// request. Gemini-style clients pass `?key=sk-...` and several OAuth and
// payment callbacks carry single-use codes, so these values must never reach
// the access log in clear text.
var credentialQueryKeys = map[string]struct{}{
	"key":           {},
	"api_key":       {},
	"apikey":        {},
	"token":         {},
	"access_token":  {},
	"refresh_token": {},
	"id_token":      {},
	"password":      {},
	"secret":        {},
	"client_secret": {},
	"code":          {},
	"sig":           {},
	"signature":     {},
}

// redactRequestTarget removes credential values from a "path?query" request
// target before it is written to the access log.
func redactRequestTarget(target string) string {
	path, rawQuery, hasQuery := strings.Cut(target, "?")
	if !hasQuery || rawQuery == "" {
		return target
	}
	values, err := url.ParseQuery(rawQuery)
	if err != nil {
		// An unparseable query cannot be inspected key by key, so drop it
		// wholesale rather than risk logging a credential.
		return path + "?[REDACTED]"
	}
	redacted := false
	for name, entries := range values {
		if _, isCredential := credentialQueryKeys[strings.ToLower(name)]; !isCredential {
			continue
		}
		for index := range entries {
			if entries[index] != "" {
				entries[index] = "[REDACTED]"
				redacted = true
			}
		}
	}
	if !redacted {
		return target
	}
	return path + "?" + values.Encode()
}

func RouteTag(tag string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set(RouteTagKey, tag)
		c.Next()
	}
}

func SetUpLogger(server *gin.Engine) {
	server.Use(gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		var requestID string
		if param.Keys != nil {
			requestID, _ = param.Keys[common.RequestIdKey].(string)
		}
		tag, _ := param.Keys[RouteTagKey].(string)
		if tag == "" {
			tag = "web"
		}
		return fmt.Sprintf("[GIN] %s | %s | %s | %3d | %13v | %15s | %7s %s\n",
			param.TimeStamp.Format("2006/01/02 - 15:04:05"),
			tag,
			requestID,
			param.StatusCode,
			param.Latency,
			param.ClientIP,
			param.Method,
			redactRequestTarget(param.Path),
		)
	}))
}
