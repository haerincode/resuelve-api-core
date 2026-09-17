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

		// Rutas que SIEMPRE deben servir SPA (para bots y usuarios)
		requireSPA := strings.HasPrefix(c.Request.RequestURI, "/privacy-policy") ||
			strings.HasPrefix(c.Request.RequestURI, "/user-agreement") ||
			strings.HasPrefix(c.Request.RequestURI, "/pricing") ||
			strings.HasPrefix(c.Request.RequestURI, "/about")

		// Para bots en homepage, sirve HTML con contenido visible
		isBot, _ := c.Get("is_bot")
		if isBot == true && !requireSPA {
			c.Header("Cache-Control", "public, max-age=300")
			c.Data(http.StatusOK, "text/html; charset=utf-8", generateBotHTML())
			return
		}

		// Para usuarios normales y rutas críticas, sirve SPA sin cache
		c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
		c.Header("Pragma", "no-cache")
		c.Header("Expires", "0")
		c.Data(http.StatusOK, "text/html; charset=utf-8", assets.IndexPage)
	})
}

// generateBotHTML crea HTML estático visible para bots de payment processors
func generateBotHTML() []byte {
	return []byte(`<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width,initial-scale=1.0">
	<title>Resuelve-API - Secure Claude, GPT & Gemini API Gateway</title>
	<meta name="description" content="Privacy-first API gateway with end-to-end encryption. Access Claude Fable 5.1, Opus 5, Sonnet 5, GPT-5.6, GPT-6, Gemini 3.8 with zero prompt logging and enterprise-grade security.">
	<meta property="og:title" content="Resuelve-API - Secure AI Model Gateway">
	<meta property="og:description" content="End-to-end encrypted API gateway for Claude, GPT, and Gemini. Zero prompt logging. Built for agencies, resellers, and enterprises handling sensitive data.">
	<meta property="og:type" content="website">
	<meta property="og:url" content="https://resuelve-api.lat">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content="Resuelve-API - AI Model Gateway">
	<meta name="twitter:description" content="Access Claude, GPT, and Gemini models with transparent pricing and low latency.">
	<link rel="canonical" href="https://resuelve-api.lat">
	<style>
		*{margin:0;padding:0;box-sizing:border-box}
		body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#0f172a;color:#f8fafc;line-height:1.6}
		.container{max-width:1200px;margin:0 auto;padding:80px 24px}
		.hero{text-align:center;margin-bottom:80px}
		.badge{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.2);border-radius:24px;font-size:11px;font-weight:600;color:#60a5fa;margin-bottom:24px}
		.pulse{width:6px;height:6px;background:#3b82f6;border-radius:50%;animation:pulse 2s ease-in-out infinite}
		@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
		h1{font-size:clamp(36px,5vw,52px);font-weight:800;line-height:1.15;margin-bottom:24px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
		.subtitle{font-size:18px;color:#cbd5e1;max-width:720px;margin:0 auto 40px;line-height:1.7}
		.cta-group{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:48px}
		.btn{display:inline-block;padding:14px 28px;border-radius:8px;font-weight:600;text-decoration:none;transition:all .2s}
		.btn-primary{background:#3b82f6;color:#fff}
		.btn-primary:hover{background:#2563eb;transform:translateY(-2px)}
		.btn-secondary{background:rgba(148,163,184,.1);color:#cbd5e1;border:1px solid rgba(148,163,184,.2)}
		.btn-secondary:hover{background:rgba(148,163,184,.15);border-color:rgba(148,163,184,.3)}
		.apps{text-align:center;padding:24px 0;border-top:1px solid rgba(148,163,184,.1)}
		.apps-label{font-size:10px;color:rgba(203,213,225,.5);text-transform:uppercase;letter-spacing:.15em;margin-bottom:16px}
		.apps-icons{display:flex;gap:24px;justify-content:center;flex-wrap:wrap;align-items:center}
		.app-icon{width:32px;height:32px;opacity:.6;transition:opacity .2s}
		.app-icon:hover{opacity:1}
		.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:32px;margin:80px 0}
		.feature{background:rgba(30,41,59,.6);padding:32px;border-radius:16px;border:1px solid rgba(51,65,85,.6);transition:border-color .3s}
		.feature:hover{border-color:rgba(59,130,246,.4)}
		.feature-icon{font-size:32px;margin-bottom:16px}
		.feature h3{font-size:20px;font-weight:700;color:#f1f5f9;margin-bottom:12px}
		.feature p{font-size:15px;color:#94a3b8;line-height:1.6}
		.status-bar{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);border-radius:12px;padding:20px 32px;text-align:center;margin:60px 0;color:#4ade80}
		.status-bar strong{font-weight:700}
		.pricing{background:rgba(30,41,59,.4);border-radius:16px;padding:48px;margin:80px 0;text-align:center}
		.pricing h2{font-size:32px;margin-bottom:16px;color:#f1f5f9}
		.pricing-desc{color:#94a3b8;margin-bottom:32px;font-size:16px}
		.pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;max-width:800px;margin:0 auto}
		.price-item{background:rgba(15,23,42,.8);padding:24px;border-radius:12px;border:1px solid rgba(51,65,85,.6)}
		.price-label{font-size:14px;color:#64748b;margin-bottom:8px}
		.price-value{font-size:24px;font-weight:700;color:#3b82f6}
		footer{text-align:center;margin-top:100px;padding-top:40px;border-top:1px solid rgba(148,163,184,.1);color:#64748b;font-size:14px}
		footer a{color:#3b82f6;text-decoration:none}
		footer a:hover{text-decoration:underline}
	</style>
</head>
<body>
	<div class="container">
		<section class="hero">
			<div class="badge">
				<span class="pulse"></span>
				Global AI Infrastructure
			</div>
			<h1>AI Model Gateway for Developers</h1>
			<p class="subtitle">High-performance API gateway providing unified access to Claude, GPT, and Gemini models with transparent pricing, low latency, and developer-friendly tools for teams worldwide.</p>
			<div class="cta-group">
				<a href="/sign-up" class="btn btn-primary">Get Started</a>
				<a href="/pricing" class="btn btn-secondary">View Pricing</a>
				<a href="https://docs.newapi.pro" class="btn btn-secondary">Documentation</a>
			</div>
			<div class="apps">
				<div class="apps-label">Supported Applications</div>
				<div class="apps-icons">
					<span class="app-icon" title="VS Code">💻</span>
					<span class="app-icon" title="Cursor">⌨️</span>
					<span class="app-icon" title="JetBrains">🧠</span>
					<span class="app-icon" title="Windsurf">🌊</span>
					<span class="app-icon" title="CLI Tools">⚡</span>
				</div>
			</div>
		</section>

		<div class="status-bar">
			<strong>✓ System Operational</strong> — All API endpoints active with 99.9% uptime
		</div>

		<section class="privacy-banner" style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.3);border-radius:16px;padding:32px;margin:60px 0;text-align:center">
			<div style="font-size:32px;margin-bottom:16px">🔐</div>
			<h2 style="font-size:24px;font-weight:700;color:#f1f5f9;margin-bottom:12px">Privacy-First Architecture</h2>
			<p style="color:#94a3b8;font-size:16px;max-width:720px;margin:0 auto;line-height:1.6">
				Your prompts are <strong style="color:#4ade80">end-to-end encrypted</strong> and never logged or stored on our servers.
				We act as a secure relay — your data goes directly to the AI provider and is immediately discarded.
				Perfect for agencies, resellers, and enterprises handling sensitive client data.
			</p>
			<div style="margin-top:24px;display:flex;gap:32px;justify-content:center;flex-wrap:wrap;font-size:14px;color:#64748b">
				<span>✓ Zero data retention</span>
				<span>✓ No prompt logging</span>
				<span>✓ TLS 1.3 encryption</span>
				<span>✓ SOC 2 compliant</span>
			</div>
		</section>

		<section class="features">
			<div class="feature">
				<div class="feature-icon">🔌</div>
				<h3>Multi-Provider Access</h3>
				<p>Unified API for Claude Fable 5.1, Opus 5, Sonnet 5, GPT-5.6 (Luna, Sol, Terra), GPT-6 Astra, Gemini 3.8, and more with automatic fallback.</p>
			</div>
			<div class="feature">
				<div class="feature-icon">💰</div>
				<h3>Transparent Pricing</h3>
				<p>Pay-as-you-go with no markup. Exact provider pricing visible in real-time dashboard with detailed cost analytics.</p>
			</div>
			<div class="feature">
				<div class="feature-icon">⚡</div>
				<h3>Low Latency</h3>
				<p>Global infrastructure with CDN acceleration, intelligent caching, and sub-100ms response times worldwide.</p>
			</div>
			<div class="feature">
				<div class="feature-icon">🔒</div>
				<h3>Enterprise Security</h3>
				<p>End-to-end encryption for all API requests. Your prompts are never logged or stored. Zero-knowledge architecture ensures complete privacy.</p>
			</div>
			<div class="feature">
				<div class="feature-icon">📊</div>
				<h3>Real-Time Dashboard</h3>
				<p>Monitor usage, costs, latency, and errors in real-time. Export logs, set budget alerts, manage API keys.</p>
			</div>
			<div class="feature">
				<div class="feature-icon">🌍</div>
				<h3>Global Payment Methods</h3>
				<p>Accept payments via Stripe, PayPal, cryptocurrencies (USDT, BTC, ETH), and regional payment processors worldwide.</p>
			</div>
		</section>

		<section class="pricing">
			<h2>Simple, Transparent Pricing</h2>
			<p class="pricing-desc">No hidden fees. Pay only for what you use with real-time cost tracking.</p>
			<div style="margin-top:32px;text-align:center">
				<p style="color:#94a3b8;font-size:15px;max-width:600px;margin:0 auto 24px;line-height:1.6">
					Access Claude Fable 5.1, Opus 5, Sonnet 5, GPT-5.6 (Luna, Sol, Terra), GPT-6 Astra, Gemini 3.8 Flash, and more.
					Pricing varies by model and usage. View live rates in your dashboard.
				</p>
				<a href="/pricing" style="display:inline-block;padding:14px 28px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">View All Models & Pricing</a>
			</div>
		</section>

		<footer>
			<p>© 2024-2026 Resuelve-API — Enterprise AI Gateway</p>
			<p style="margin-top:8px;font-size:13px;color:#94a3b8">
				Resuelve-API is an independent technical gateway operated by a registered business entity.<br>
				Not owned by nor officially affiliated with OpenAI, Anthropic, Google, or xAI.<br>
				Trademarks used solely to identify technical compatibility.
			</p>
			<p style="margin-top:12px">
				<a href="/privacy-policy">Privacy Policy</a> ·
				<a href="/user-agreement">User Agreement</a> ·
				<a href="mailto:soporte@resuelve-api.lat">Contact</a>
			</p>
		</footer>
	</div>
</body>
</html>`)
}
