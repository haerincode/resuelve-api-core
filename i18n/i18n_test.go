package i18n

import (
	"io/fs"
	"net/http"
	"net/http/httptest"
	"path"
	"regexp"
	"sort"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var messageLine = regexp.MustCompile(`^([\w.]+):\s*"(.*)"\s*$`)

// loadLocaleFile parses a locale YAML into a key -> message map. The files are
// flat "key: value" pairs, so a line-based parse keeps the test independent of
// the YAML library and preserves duplicate detection.
func loadLocaleFile(t *testing.T, name string) map[string]string {
	t.Helper()

	raw, err := fs.ReadFile(localeFS, path.Join("locales", name))
	require.NoError(t, err, "read %s", name)

	messages := make(map[string]string)
	for i, line := range strings.Split(string(raw), "\n") {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		match := messageLine.FindStringSubmatch(trimmed)
		require.NotNil(t, match, "%s:%d is not a quoted key/value pair: %s", name, i+1, trimmed)
		_, duplicate := messages[match[1]]
		require.False(t, duplicate, "%s declares %q twice", name, match[1])
		messages[match[1]] = match[2]
	}
	return messages
}

func templatePlaceholders(message string) []string {
	found := regexp.MustCompile(`\{\{\.\w+\}\}`).FindAllString(message, -1)
	sort.Strings(found)
	return found
}

// TestLocalesCoverEveryEnglishMessage guards the contract every localized API
// error depends on: a user whose language is not English must never fall back to
// an English string because a key was forgotten, and interpolated values must
// survive translation or the message renders with a literal {{.Model}}.
func TestLocalesCoverEveryEnglishMessage(t *testing.T) {
	english := loadLocaleFile(t, "en.yaml")
	require.NotEmpty(t, english)

	for _, name := range []string{"es.yaml", "zh-CN.yaml", "zh-TW.yaml"} {
		t.Run(name, func(t *testing.T) {
			translated := loadLocaleFile(t, name)

			for key, englishMessage := range english {
				message, ok := translated[key]
				require.True(t, ok, "%s is missing %q", name, key)
				assert.NotEmpty(t, strings.TrimSpace(message), "%s has an empty message for %q", name, key)
				assert.Equal(t, templatePlaceholders(englishMessage), templatePlaceholders(message),
					"%s changes the template placeholders of %q", name, key)
			}

			for key := range translated {
				_, ok := english[key]
				assert.True(t, ok, "%s declares %q, which en.yaml does not", name, key)
			}
		})
	}
}

// TestTranslateResolvesSpanish covers the wiring a Spanish-speaking user
// depends on end to end: the locale is registered, reachable through the gin
// context, and interpolates template data.
func TestTranslateResolvesSpanish(t *testing.T) {
	require.NoError(t, Init())

	spanish := Translate(LangEs, MsgQuotaInsufficient)
	assert.Equal(t, "Cuota insuficiente", spanish)
	assert.NotEqual(t, Translate(LangEn, MsgQuotaInsufficient), spanish,
		"Spanish must not fall through to the English message")

	withData := Translate(LangEs, MsgDistributorTokenModelForbidden, map[string]any{"Model": "gpt-5.6"})
	assert.Contains(t, withData, "gpt-5.6")
	assert.NotContains(t, withData, "{{")

	gin.SetMode(gin.TestMode)
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Request = httptest.NewRequest(http.MethodGet, "/", nil)
	c.Request.Header.Set("Accept-Language", "es-CL,es;q=0.9")
	assert.Equal(t, "Cuota insuficiente", T(c, MsgQuotaInsufficient))
}

// TestNormalizeLangAcceptsSpanishTags keeps regional Spanish tags — the ones a
// Chilean or Mexican browser actually sends — from silently falling back to
// English.
func TestNormalizeLangAcceptsSpanishTags(t *testing.T) {
	for _, tag := range []string{"es", "es-CL", "es-419", "ES-MX", " es-ES "} {
		assert.Equal(t, LangEs, normalizeLang(tag), "normalizeLang(%q)", tag)
		assert.True(t, IsSupported(tag), "IsSupported(%q)", tag)
	}

	assert.Equal(t, LangEs, ParseAcceptLanguage("es-CL,es;q=0.9,en;q=0.8"))
	assert.Equal(t, LangEn, normalizeLang("de-DE"), "unsupported tags fall back to the default")
}
