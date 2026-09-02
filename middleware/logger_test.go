package middleware

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRedactRequestTargetHidesCredentialQueryValues(t *testing.T) {
	testCases := []struct {
		name     string
		target   string
		expected string
	}{
		{
			name:     "gemini style api key",
			target:   "/v1beta/models/gemini-2.5-pro:generateContent?key=sk-secret-value",
			expected: "/v1beta/models/gemini-2.5-pro:generateContent?key=%5BREDACTED%5D",
		},
		{
			name:     "oauth authorization code",
			target:   "/api/oauth/github?code=abc123",
			expected: "/api/oauth/github?code=%5BREDACTED%5D",
		},
		{
			name:     "credential mixed with harmless parameter",
			target:   "/v1/models?key=sk-secret-value&page=2",
			expected: "/v1/models?key=%5BREDACTED%5D&page=2",
		},
		{
			name:     "credential name is matched case insensitively",
			target:   "/v1/models?KEY=sk-secret-value",
			expected: "/v1/models?KEY=%5BREDACTED%5D",
		},
		{
			name:     "repeated credential parameter",
			target:   "/v1/models?key=first-secret&key=second-secret",
			expected: "/v1/models?key=%5BREDACTED%5D&key=%5BREDACTED%5D",
		},
		{
			name:     "unparseable query is dropped wholesale",
			target:   "/v1/models?key=%zz",
			expected: "/v1/models?[REDACTED]",
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			assert.Equal(t, testCase.expected, redactRequestTarget(testCase.target))
			assert.NotContains(t, redactRequestTarget(testCase.target), "secret")
		})
	}
}

func TestRedactRequestTargetPreservesNonCredentialTargets(t *testing.T) {
	testCases := []string{
		"/api/user/self",
		"/api/log?page=2&page_size=50",
		"/v1/chat/completions",
		"/api/log?",
	}

	for _, target := range testCases {
		t.Run(target, func(t *testing.T) {
			assert.Equal(t, target, redactRequestTarget(target), "a target without credentials must be logged verbatim")
		})
	}
}
