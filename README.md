# 🚀 Resuelve-API - Gateway de IA para Chile y LatAm

**API Gateway económico para Claude Opus 5, Sonnet 5, GPT-5.6 Plus y más modelos de IA.**

[![Deploy](https://img.shields.io/badge/deploy-render-46e3b7)](https://resuelve-api.lat)
[![License](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)

---

## 🎯 ¿Por qué Resuelve-API?

- **77% más barato** que las APIs oficiales de Anthropic y OpenAI
- **Paga en pesos chilenos** con Webpay, Cuenta RUT, Redcompra o USDT
- **Compatible con OpenAI API** - funciona con Cursor, Cline, VS Code y más
- **Prompt Caching nativo** - ahorra hasta 90% adicional
- **Sin suscripciones** - paga solo lo que usas

## 💰 Comparativa de Precios (por millón de tokens)

| Modelo | Oficial | Resuelve-API | Ahorro |
|--------|---------|--------------|--------|
| Claude Opus 5 | $5.00 | $1.75 | 65% |
| Claude Sonnet 5 | $3.00 | $0.70 | 77% |
| GPT-5.6 Plus | $2.50 | $0.50 | 80% |
| GPT-5.6 Terra | $2.50 | $0.14 | 94% |

*Con prompt caching: hasta 90% adicional de descuento*

## 🛠️ Stack Técnico

### Backend
- **Go 1.25.1** - API Gateway de alta performance
- **PostgreSQL** - Base de datos
- **Redis** - Cache y rate limiting
- **Render** - Deploy y hosting

### Frontend
- **React 18** + **TypeScript**
- **TanStack Router** - Routing type-safe
- **TanStack Query** - Data fetching
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Componentes UI
- **i18next** - Internacionalización (ES/EN)

## 🚀 Quick Start

### Configurar en Cursor

1. Crea tu cuenta en [resuelve-api.lat](https://resuelve-api.lat)
2. Recarga saldo (desde $3 USD)
3. Genera tu API Key en el panel
4. En Cursor, ve a `Settings → Models → OpenAI API Key`:
   - **Base URL**: `https://resuelve-api.lat/v1`
   - **API Key**: `sk-tu-clave-generada`
5. ¡Listo! Ya puedes usar Claude Opus 5, Sonnet 5 y más

[📖 Guía completa de Cursor](https://resuelve-api.lat/docs/cursor)

## 📦 Instalación Local

### Backend

```bash
# Clonar repositorio
git clone https://github.com/haerincode/resuelve-api-core.git
cd resuelve-api-core

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Instalar dependencias y ejecutar
go mod download
go run main.go
```

### Frontend

```bash
cd web

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Agregar tu Google Analytics ID

# Desarrollo
npm run dev

# Producción
npm run build
npm run preview
```

## 🌍 Variables de Entorno

```bash
# Google Analytics 4
VITE_GA_ID=G-XXXXXXXXXX

# Google Tag Manager
VITE_GTM_ID=GTM-XXXXXXX

# Microsoft Clarity (opcional)
VITE_CLARITY_ID=YOUR_CLARITY_ID
```

## 📝 Blog y Contenido

Publicamos guías prácticas y comparativas honestas sobre APIs de IA:

- [Claude Opus 5 vs Sonnet 5: ¿Cuál elegir?](https://resuelve-api.lat/blog/claude-opus-5-vs-sonnet-5-cual-elegir)
- [Cómo ahorré $500/mes en APIs de IA](https://resuelve-api.lat/blog/como-ahorre-500-dolares-al-mes-en-apis-de-ia)
- [Cursor vs GitHub Copilot 2026](https://resuelve-api.lat/blog/cursor-vs-github-copilot-2026)
- [Webpay vs Tarjeta Internacional](https://resuelve-api.lat/blog/webpay-vs-tarjeta-internacional-pagar-apis-ia)

## 🔧 Modelos Disponibles

### Anthropic Claude
- `claude-opus-5-20241022` - Máxima capacidad (200k ctx)
- `claude-sonnet-5-20241022` - Balance perfecto (200k ctx)
- `claude-haiku-3-5-20241022` - Ultra rápido (200k ctx)

### OpenAI GPT
- `gpt-5.6-plus` - Multimodal avanzado (128k ctx)
- `gpt-5.6-sol` - Balance costo-calidad (128k ctx)
- `gpt-5.6-terra` - Económico para bots (128k ctx)
- `o3-mini` - Razonamiento profundo (200k ctx)

### Google Gemini
- `gemini-2.0-flash-exp` - Ultra rápido (1M ctx)
- `gemini-exp-1206` - Experimental (2M ctx)

## 💳 Métodos de Pago

### 🇨🇱 Chile
- Webpay Plus
- Cuenta RUT
- Redcompra
- Transferencia bancaria (Flow)

### 🌎 Internacional
- USDT (TRC20, BSC, Binance Pay)
- Transferencias internacionales

## 📊 SEO y Performance

- **Meta tags** optimizados por página
- **Schema.org** markup (Organization, FAQPage, BlogPosting)
- **Google Analytics 4** + **GTM** integrados
- **Sitemap XML** dinámico
- **robots.txt** optimizado
- **Core Web Vitals** optimizados
- **Lazy loading** de imágenes
- **5 landing pages** por keyword específica

### Keywords cubiertas:
- claude opus 5 barato chile
- api openai pesos chilenos
- cursor precio token economico
- gpt-5.6 plus chile
- alternativa anthropic barata

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

AGPL-3.0 License - ver [LICENSE](LICENSE) para detalles.

## 📞 Contacto

- **Email**: contacto@resuelve-api.lat
- **Website**: [resuelve-api.lat](https://resuelve-api.lat)
- **Documentación**: [Notion Docs](https://app.notion.so/Gu-a-b-sica-de-instalaci-n-3c9419e6bf3c8002b302eff6923274b6)

## 🌟 Agradecimientos

Este proyecto usa tecnología de:
- [OpenAI](https://openai.com)
- [Anthropic](https://anthropic.com)
- [Google AI](https://ai.google)

---

**¿Preguntas?** Abre un [issue](https://github.com/haerincode/resuelve-api-core/issues) o contáctanos en contacto@resuelve-api.lat
