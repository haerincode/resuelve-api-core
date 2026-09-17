package router

import (
	"embed"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/middleware"
	"github.com/gin-contrib/gzip"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

// WebAssets holds the embedded dashboard frontend assets.
type WebAssets struct {
	BuildFS   embed.FS
	IndexPage []byte
}

func SetWebRouter(router *gin.Engine, assets WebAssets) {
	frontendFS := common.EmbedFolder(assets.BuildFS, "web/dist")

	router.Use(gzip.Gzip(gzip.BestCompression))
	router.Use(middleware.GlobalWebRateLimit())
	router.Use(middleware.BotDetector())
	router.Use(middleware.StaticAssetCache())
	router.Use(middleware.Cache())
	router.Use(static.Serve("/", frontendFS))
	router.NoRoute(func(c *gin.Context) {
		c.Set(middleware.RouteTagKey, "web")
		if strings.HasPrefix(c.Request.RequestURI, "/v1") || strings.HasPrefix(c.Request.RequestURI, "/api") || strings.HasPrefix(c.Request.RequestURI, "/assets") {
			controller.RelayNotFound(c)
			return
		}

		// Para bots (payment processors, crawlers), sirve HTML con contenido visible
		isBot, _ := c.Get("is_bot")
		if isBot == true {
			c.Header("Cache-Control", "public, max-age=300")
			c.Data(http.StatusOK, "text/html; charset=utf-8", generateBotHTML())
			return
		}

		// Para usuarios normales, sirve SPA sin cache
		c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
		c.Header("Pragma", "no-cache")
		c.Header("Expires", "0")
		c.Data(http.StatusOK, "text/html; charset=utf-8", assets.IndexPage)
	})
}

// generateBotHTML crea HTML estático visible para bots de payment processors
func generateBotHTML() []byte {
	return []byte(`<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<meta name="description" content="Resuelve API - Plataforma de gestión de API con soporte para múltiples proveedores de IA">
	<title>Resuelve API - API Management Platform</title>
	<style>
		body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0F172A;color:#F8FAFC}
		.container{max-width:1200px;margin:0 auto;padding:60px 20px}
		h1{font-size:48px;margin:0 0 20px;background:linear-gradient(135deg,#38BDF8,#22D3EE);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
		p{font-size:18px;line-height:1.6;color:#CBD5E1;margin:0 0 40px}
		.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;margin:60px 0}
		.feature{background:#1E293B;padding:32px;border-radius:12px;border:1px solid #334155}
		.feature h3{color:#38BDF8;margin:0 0 12px;font-size:20px}
		.feature p{font-size:16px;color:#94A3B8;margin:0}
		.cta{display:inline-block;background:#F97316;color:#fff;padding:16px 32px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:20px}
		.status{background:#1E293B;padding:20px;border-radius:8px;border-left:4px solid #22D3EE;margin:40px 0}
		.status strong{color:#22D3EE}
	</style>
</head>
<body>
	<div class="container">
		<h1>Resuelve API</h1>
		<p>Plataforma profesional de gestión de API con soporte para múltiples proveedores de inteligencia artificial, gestión de canales, monitoreo en tiempo real y sistema de facturación integrado.</p>

		<div class="status">
			<strong>✓ Sistema operativo</strong> - API activa con soporte SSL/TLS
		</div>

		<div class="features">
			<div class="feature">
				<h3>🔌 Multi-Provider</h3>
				<p>Soporte para OpenAI, Claude, Gemini, AWS Bedrock y más de 30 proveedores de IA</p>
			</div>
			<div class="feature">
				<h3>📊 Dashboard</h3>
				<p>Panel de control en tiempo real con métricas, logs y gestión de canales</p>
			</div>
			<div class="feature">
				<h3>💳 Pagos</h3>
				<p>Sistema de facturación con soporte para Stripe, PayPal y NOWPayments</p>
			</div>
			<div class="feature">
				<h3>🔒 Seguridad</h3>
				<p>Rate limiting, autenticación OAuth, encriptación end-to-end</p>
			</div>
			<div class="feature">
				<h3>⚡ Performance</h3>
				<p>Cache inteligente, balanceo de carga y optimización automática</p>
			</div>
			<div class="feature">
				<h3>📈 Analytics</h3>
				<p>Métricas detalladas de uso, costos y rendimiento por canal</p>
			</div>
		</div>

		<p style="margin-top:60px;text-align:center;font-size:16px;color:#64748B">
			© 2024 Resuelve API - Plataforma empresarial de gestión de API<br>
			Contacto: <a href="mailto:support@resuelve-api.lat" style="color:#38BDF8">support@resuelve-api.lat</a>
		</p>
	</div>
</body>
</html>`)
}
