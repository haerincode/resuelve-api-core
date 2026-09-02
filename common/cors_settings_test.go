package common

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestInitCORSSettingsDefaultsToWildcardMode(t *testing.T) {
	t.Setenv("CORS_ALLOW_ORIGINS", "")
	require.NoError(t, InitCORSSettings())
	assert.Empty(t, CORSAllowOrigins)
}

func TestInitCORSSettingsNormalizesAndTrimsOrigins(t *testing.T) {
	t.Setenv("CORS_ALLOW_ORIGINS", " https://Example.com:443 , http://localhost:3000 ")
	require.NoError(t, InitCORSSettings())
	assert.Equal(t, []string{"https://example.com", "http://localhost:3000"}, CORSAllowOrigins)
}

func TestInitCORSSettingsRejectsUnusableValues(t *testing.T) {
	testCases := []struct {
		name  string
		value string
	}{
		{name: "explicit wildcard", value: "*"},
		{name: "wildcard subdomain", value: "https://*.example.com"},
		{name: "origin with path", value: "https://example.com/app"},
		{name: "missing scheme", value: "example.com"},
		{name: "no entries", value: ", ,"},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			t.Setenv("CORS_ALLOW_ORIGINS", testCase.value)
			assert.Error(t, InitCORSSettings())
			assert.Empty(t, CORSAllowOrigins, "a rejected configuration must not leave a partial allowlist")
		})
	}
}
