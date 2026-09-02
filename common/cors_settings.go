package common

import (
	"fmt"
	"os"
	"strings"
)

// CORSAllowOrigins is the exact browser origin allowlist used by the relay and
// dashboard CORS middleware. When it is empty the middleware keeps the historic
// wildcard behavior, which stays safe only because wildcard responses are never
// allowed to carry credentials.
var CORSAllowOrigins []string

// InitCORSSettings parses CORS_ALLOW_ORIGINS. Configuring at least one origin
// switches CORS from wildcard to an exact-origin allowlist that may carry
// credentials, so every entry must be a bare scheme+host origin.
func InitCORSSettings() error {
	CORSAllowOrigins = nil
	raw := strings.TrimSpace(os.Getenv("CORS_ALLOW_ORIGINS"))
	if raw == "" {
		return nil
	}
	if strings.EqualFold(raw, "*") {
		return fmt.Errorf("CORS_ALLOW_ORIGINS does not accept '*'; leave it unset for wildcard mode")
	}
	var origins []string
	for _, entry := range strings.Split(raw, ",") {
		entry = strings.TrimSpace(entry)
		if entry == "" {
			continue
		}
		origin, err := NormalizeOrigin(entry)
		if err != nil {
			return fmt.Errorf("invalid CORS_ALLOW_ORIGINS entry %q: %w", entry, err)
		}
		origins = append(origins, origin)
	}
	if len(origins) == 0 {
		return fmt.Errorf("CORS_ALLOW_ORIGINS does not contain an origin")
	}
	CORSAllowOrigins = origins
	return nil
}
