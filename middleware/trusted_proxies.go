package middleware

import (
	"errors"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

var defaultTrustedProxyCIDRs = []string{
	"127.0.0.0/8",
	"::1",
	"10.0.0.0/8",
	"172.16.0.0/12",
	"192.168.0.0/16",
	"fc00::/7",
}

func ConfigureTrustedProxies(engine *gin.Engine) error {
	rawTrustedProxies := strings.TrimSpace(os.Getenv("TRUSTED_PROXIES"))
	if rawTrustedProxies == "" {
		// For Heroku and cloud platforms, default to trusting common private networks
		log.Print("WARNING: TRUSTED_PROXIES is unset; trusting loopback, RFC 1918, and IPv6 ULA proxy addresses. For Heroku, this is typically correct. Set TRUSTED_PROXIES=none to trust no proxies, or configure explicit proxy IPs/CIDRs.")
		return engine.SetTrustedProxies(defaultTrustedProxyCIDRs)
	}
	if strings.EqualFold(rawTrustedProxies, "none") {
		return engine.SetTrustedProxies(nil)
	}

	parts := strings.Split(rawTrustedProxies, ",")
	trustedProxies := make([]string, 0, len(parts))
	for _, part := range parts {
		trustedProxy := strings.TrimSpace(part)
		if trustedProxy == "" {
			continue
		}
		if strings.EqualFold(trustedProxy, "none") {
			return errors.New("TRUSTED_PROXIES=none must be used alone")
		}
		trustedProxies = append(trustedProxies, trustedProxy)
	}
	if len(trustedProxies) == 0 {
		return errors.New("TRUSTED_PROXIES does not contain an IP address or CIDR")
	}
	if err := engine.SetTrustedProxies(trustedProxies); err != nil {
		return fmt.Errorf("invalid TRUSTED_PROXIES: %w", err)
	}
	log.Printf("Configured trusted proxies: %v", trustedProxies)
	return nil
}
