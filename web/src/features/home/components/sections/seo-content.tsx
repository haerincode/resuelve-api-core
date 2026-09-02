/*
Copyright (C) 2023-2026 QuantumNous
*/
import { useTranslation } from 'react-i18next'

export function SEOContent() {
  const { t } = useTranslation()

  return (
    <section className='border-border/40 bg-muted/5 mx-auto max-w-6xl px-6 py-16 md:py-20'>
      <div className='prose prose-slate dark:prose-invert mx-auto max-w-4xl'>
        <h2 className='mb-6 text-2xl font-bold tracking-tight md:text-3xl'>
          {t('seo.heading', 'API de Claude, GPT y Gemini para Desarrolladores en Chile y Latinoamérica')}
        </h2>

        <div className='text-muted-foreground space-y-4 text-base leading-relaxed'>
          <p>
            {t('seo.intro', 'Resuelve-API es la plataforma líder de acceso a modelos de inteligencia artificial para desarrolladores, empresas y creadores en Chile, Argentina, México, Colombia, Perú y toda Latinoamérica. Ofrecemos acceso directo a Claude Opus 5, Claude Sonnet 5, GPT-4, GPT-5.6 Plus, Gemini Pro y más de 40 modelos de IA mediante una API compatible con OpenAI.')}
          </p>

          <p>
            {t('seo.payment', 'Acepta pagos en pesos chilenos (CLP) con Webpay, Flow y transferencias bancarias locales, además de criptomonedas USDT (TRC20). Sin suscripciones mensuales: paga solo por lo que usas con nuestro sistema de prepago flexible. Recarga desde $5.000 CLP y empieza a usar Claude, GPT o Gemini en menos de 5 minutos.')}
          </p>

          <h3 className='mt-8 mb-4 text-xl font-semibold'>
            {t('seo.features.title', '¿Por Qué Elegir Resuelve-API?')}
          </h3>

          <ul className='list-disc space-y-2 pl-6'>
            <li>
              <strong>{t('seo.features.pricing', 'Hasta 77% de descuento:')}</strong> {t('seo.features.pricing_desc', 'Prompt caching automático reduce costos radicalmente. Claude Opus 5 desde $0.14/M tokens, GPT-4 desde $0.75/M tokens.')}
            </li>
            <li>
              <strong>{t('seo.features.compatibility', 'Compatible con tu stack:')}</strong> {t('seo.features.compatibility_desc', 'Funciona con Cursor, Cline, VS Code, Continue, Cherry Studio, OpenWebUI y cualquier cliente OpenAI. Cambia solo la URL base.')}
            </li>
            <li>
              <strong>{t('seo.features.latam', 'Diseñado para LatAm:')}</strong> {t('seo.features.latam_desc', 'Paga con Webpay, Flow, transferencia bancaria chilena o USDT. Soporte en español, facturación local, sin fricciones internacionales.')}
            </li>
            <li>
              <strong>{t('seo.features.reliability', 'Confiabilidad 99.9%:')}</strong> {t('seo.features.reliability_desc', 'Infraestructura redundante con failover automático. Si un proveedor falla, el tráfico se redirige sin downtime.')}
            </li>
            <li>
              <strong>{t('seo.features.transparent', 'Precios transparentes:')}</strong> {t('seo.features.transparent_desc', 'Sin cargos ocultos ni comisiones sorpresa. Dashboard en tiempo real muestra consumo token a token.')}
            </li>
          </ul>

          <h3 className='mt-8 mb-4 text-xl font-semibold'>
            {t('seo.use_cases.title', 'Casos de Uso')}
          </h3>

          <p>
            {t('seo.use_cases.desc', 'Desarrolladores usan Resuelve-API para autocomplete inteligente en Cursor y VS Code, chatbots empresariales con Claude, análisis de datos con GPT-4, generación de contenido, traducción automática, customer support con IA, automatización de workflows, research assistants, code review automatizado, y fine-tuning de embeddings. Empresas de e-commerce, fintech, edtech, healthtech y agencias digitales confían en nuestra infraestructura.')}
          </p>

          <h3 className='mt-8 mb-4 text-xl font-semibold'>
            {t('seo.models.title', 'Modelos Disponibles')}
          </h3>

          <p>
            {t('seo.models.desc', 'Claude Opus 5, Claude Sonnet 5, Claude Haiku 4.5, GPT-4 Turbo, GPT-5.6 Plus, GPT-3.5 Turbo, Gemini 2.0 Flash, Gemini Pro, Llama 3.3 70B, DeepSeek V3, Qwen 2.5, Mistral Large, Command R+, y más. Agregamos nuevos modelos cada mes. Todos con streaming, function calling, vision (imágenes) y JSON mode.')}
          </p>

          <h3 className='mt-8 mb-4 text-xl font-semibold'>
            {t('seo.integration.title', 'Integración en 3 Pasos')}
          </h3>

          <ol className='list-decimal space-y-2 pl-6'>
            <li>{t('seo.integration.step1', 'Regístrate gratis en resuelve-api.lat y recarga saldo desde $5.000 CLP')}</li>
            <li>{t('seo.integration.step2', 'Copia tu API key desde el dashboard (formato sk-xxx)')}</li>
            <li>{t('seo.integration.step3', 'Configura en tu IDE: Base URL = https://resuelve-api.lat/v1, API Key = tu-key. Listo.')}</li>
          </ol>

          <p className='mt-6'>
            {t('seo.support', 'Soporte técnico en español por Telegram, email y Discord. Documentación completa con ejemplos en Python, JavaScript, cURL y SDKs populares. Comunidad activa de desarrolladores LatAm.')}
          </p>

          <div className='bg-muted/30 mt-8 rounded-lg border border-border/40 p-6'>
            <h3 className='mb-3 text-lg font-semibold'>
              {t('seo.cta.title', '¿Listo para Empezar?')}
            </h3>
            <p className='text-muted-foreground text-sm'>
              {t('seo.cta.desc', 'Miles de desarrolladores ya usan Resuelve-API para construir productos con IA. Sin compromiso, sin tarjeta de crédito para probar. Recarga, usa, escala.')}
            </p>
          </div>

          <div className='mt-8 flex flex-wrap gap-3 text-sm'>
            <a href='/pricing' className='text-primary hover:underline'>
              {t('Ver Precios Detallados')}
            </a>
            <span className='text-muted-foreground'>•</span>
            <a href='/docs' className='text-primary hover:underline'>
              {t('Documentación Técnica')}
            </a>
            <span className='text-muted-foreground'>•</span>
            <a href='/affiliates' className='text-primary hover:underline'>
              {t('Programa de Afiliados')}
            </a>
            <span className='text-muted-foreground'>•</span>
            <a href='/about' className='text-primary hover:underline'>
              {t('Sobre Nosotros')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
