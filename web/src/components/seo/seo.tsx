/*
Copyright (C) 2023-2026 QuantumNous
*/
import { useEffect } from 'react'

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

const BASE_URL = 'https://resuelve-api.lat'
const MANAGED_ATTR = 'data-seo-managed'

function upsertMeta(
  selector: string,
  attrs: Record<string, string>
): HTMLMetaElement {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(MANAGED_ATTR, 'true')
    document.head.append(el)
  }
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value)
  }
  return el
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`
  let el = document.head.querySelector<HTMLLinkElement>(selector)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    if (hreflang) el.hreflang = hreflang
    el.setAttribute(MANAGED_ATTR, 'true')
    document.head.append(el)
  }
  el.href = href
}

export function SEO({
  title = 'Resuelve-API | Claude Opus 5, Sonnet 5 y GPT-5.6 en Pesos y USDT (77% OFF)',
  description = 'Usa Claude Opus 5, Sonnet 5 y GPT-5.6 Plus en Cursor y Cline pagando en CLP con Webpay o USDT. Sin suscripciones fijas. Hasta 77% de ahorro con prompt caching.',
  canonical,
  ogType = 'website',
  ogImage = `${BASE_URL}/og-image.jpg`,
  noindex = false,
  schema,
  keywords = 'claude opus 5 barato, claude sonnet 5 chile, gpt-5.6 plus precio, api openai chile, cursor claude precio, anthropic chile, webpay api ia, usdt claude',
}: SEOProps) {
  useEffect(() => {
    const fullCanonical = canonical ? `${BASE_URL}${canonical}` : BASE_URL

    document.title = title

    upsertMeta('meta[name="description"]', {
      name: 'description',
      content: description,
    })
    upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords })
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-snippet:-1, max-image-preview:large',
    })

    upsertLink('canonical', fullCanonical)

    const ogTags: Record<string, string> = {
      'og:type': ogType,
      'og:title': title,
      'og:description': description,
      'og:url': fullCanonical,
      'og:site_name': 'Resuelve-API',
      'og:locale': 'es_CL',
    }
    if (ogImage) {
      ogTags['og:image'] = ogImage
      ogTags['og:image:width'] = '1200'
      ogTags['og:image:height'] = '630'
    }
    for (const [property, content] of Object.entries(ogTags)) {
      upsertMeta(`meta[property="${property}"]`, { property, content })
    }

    const twitterTags: Record<string, string> = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
    }
    if (ogImage) twitterTags['twitter:image'] = ogImage
    for (const [name, content] of Object.entries(twitterTags)) {
      upsertMeta(`meta[name="${name}"]`, { name, content })
    }

    upsertLink('alternate', fullCanonical, 'es-CL')
    upsertLink('alternate', `${fullCanonical}?lang=en`, 'en')
    upsertLink('alternate', fullCanonical, 'x-default')

    const finalSchema = schema ?? {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${BASE_URL}/#organization`,
          name: 'Resuelve-API',
          url: BASE_URL,
          logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
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
          url: BASE_URL,
          description:
            'Pasarela técnica de APIs de IA compatible con OpenAI para desarrolladores de Chile y LatAm.',
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'USD',
            lowPrice: '0.14',
            highPrice: '1.75',
            offerCount: '12',
          },
        },
        {
          '@type': 'WebSite',
          '@id': `${BASE_URL}/#website`,
          url: BASE_URL,
          name: 'Resuelve-API',
          inLanguage: ['es-CL', 'en-US'],
        },
      ],
    }

    const scriptId = 'seo-jsonld'
    let script = document.getElementById(scriptId) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.type = 'application/ld+json'
      document.head.append(script)
    }
    script.textContent = JSON.stringify(finalSchema)
  }, [
    title,
    description,
    canonical,
    ogType,
    ogImage,
    noindex,
    schema,
    keywords,
  ])

  return null
}
