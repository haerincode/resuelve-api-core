/*
Copyright (C) 2023-2026 QuantumNous
*/
import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  ogType?: string
  ogImage?: string
  noindex?: boolean
  schema?: object
  keywords?: string
}

export function SEO({
  title = 'Resuelve-API | APIs de Claude y GPT en Pesos y USDT (77% OFF)',
  description = 'Usa Claude Sonnet 5, Opus y GPT-5.6 en Cursor y Cline pagando en CLP con Webpay o USDT. Sin suscripciones fijas. Hasta 77% de ahorro con prompt caching.',
  canonical,
  ogType = 'website',
  ogImage = 'https://resuelve-api.lat/og-image.jpg',
  noindex = false,
  schema,
  keywords = 'claude barato, api openai chile, cursor precio, gpt-4 chile, claude sonnet chile, api anthropic latam, webpay api ia, usdt claude',
}: SEOProps) {
  const baseUrl = 'https://resuelve-api.lat'
  const fullCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl

  const defaultSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'Resuelve-API',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
        },
        sameAs: [
          'https://github.com/haerincode/resuelve-api-core',
          'https://app.notion.so/Gu-a-b-sica-de-instalaci-n-3c9419e6bf3c8002b302eff6923274b6',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'contacto@resuelve-api.lat',
          contactType: 'Technical Support',
          areaServed: ['CL', 'AR', 'MX', 'CO', 'PE', 'EC'],
          availableLanguage: ['Spanish', 'English'],
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Resuelve-API',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'All',
        url: baseUrl,
        description:
          'Pasarela técnica de APIs de IA compatible con OpenAI para desarrolladores de Chile y LatAm.',
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'USD',
          lowPrice: '0.035',
          highPrice: '2.50',
          offerCount: '12',
        },
        featureList: [
          'Compatible con OpenAI API',
          'Soporte Claude Sonnet 5 y Opus',
          'GPT-5.6 Sol y Terra',
          'Prompt Caching',
          'Pagos en CLP y USDT',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'Resuelve-API',
        inLanguage: ['es-CL', 'en-US'],
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  const finalSchema = schema || defaultSchema

  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
      {noindex && <meta name='robots' content='noindex, nofollow' />}
      {!noindex && (
        <meta name='robots' content='index, follow, max-snippet:-1, max-image-preview:large' />
      )}

      {/* Canonical */}
      <link rel='canonical' href={fullCanonical} />

      {/* Open Graph */}
      <meta property='og:type' content={ogType} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:url' content={fullCanonical} />
      <meta property='og:site_name' content='Resuelve-API' />
      <meta property='og:locale' content='es_CL' />
      <meta property='og:locale:alternate' content='en_US' />
      {ogImage && <meta property='og:image' content={ogImage} />}
      {ogImage && <meta property='og:image:width' content='1200' />}
      {ogImage && <meta property='og:image:height' content='630' />}

      {/* Twitter Card */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      {ogImage && <meta name='twitter:image' content={ogImage} />}

      {/* Schema.org JSON-LD */}
      <script type='application/ld+json'>{JSON.stringify(finalSchema)}</script>

      {/* Alternate languages */}
      <link rel='alternate' hrefLang='es-CL' href={fullCanonical} />
      <link rel='alternate' hrefLang='en' href={`${fullCanonical}?lang=en`} />
      <link rel='alternate' hrefLang='x-default' href={fullCanonical} />
    </Helmet>
  )
}
