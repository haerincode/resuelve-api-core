/*
Copyright (C) 2023-2026 QuantumNous
*/
import { createFileRoute } from '@tanstack/react-router'
import { Check } from 'lucide-react'

import { PublicLayout } from '@/components/layout'
import { SEO } from '@/components/seo'

export const Route = createFileRoute('/pricing-seo')({
  component: PricingSEO,
})

function PricingSEO() {
  const pricingSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Resuelve-API',
    description: 'Gateway de APIs de IA con hasta 77% de descuento',
    brand: {
      '@type': 'Brand',
      name: 'Resuelve-API',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '0.07',
      highPrice: '2.50',
      offerCount: '12',
      offers: [
        {
          '@type': 'Offer',
          name: 'Claude Sonnet 5',
          price: '0.70',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Claude Opus 5',
          price: '1.75',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'GPT-5.6 Sol',
          price: '0.50',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      ],
    },
  }

  const models = [
    {
      name: 'Claude Sonnet 5',
      official: '$3.00',
      price: '$0.70',
      cache: '$0.070',
      savings: '77%',
      features: [
        'Ideal para Cursor y Cline',
        'Prompt caching incluido',
        'Respuestas rápidas',
        'Contexto 200k tokens',
      ],
    },
    {
      name: 'Claude Opus 5',
      official: '$5.00',
      price: '$1.75',
      cache: '$0.170',
      savings: '65%',
      features: [
        'Máxima capacidad analítica',
        'Razonamiento profundo',
        'Contexto 200k tokens',
        'Ideal para código complejo',
      ],
    },
    {
      name: 'GPT-5.6 Sol',
      official: '$2.50',
      price: '$0.50',
      cache: null,
      savings: '80%',
      features: [
        'Multimodal (texto + imagen)',
        'Velocidad optimizada',
        'Contexto 128k tokens',
        'Excelente costo-beneficio',
      ],
    },
    {
      name: 'GPT-5.6 Terra',
      official: '$2.50',
      price: '$0.14',
      cache: null,
      savings: '94%',
      features: [
        'Ultra económico',
        'Ideal para bots',
        'Respuestas simples',
        'Automatizaciones masivas',
      ],
    },
  ]

  return (
    <PublicLayout>
      <SEO
        title='Precios API Claude Sonnet 5 y GPT-5.6 Chile | 77% OFF'
        description='Tabla de precios oficial Resuelve-API: Claude Sonnet 5 desde $0.70, Opus $1.75, GPT-5.6 desde $0.14 por millón de tokens. Paga en CLP con Webpay o USDT.'
        canonical='/pricing'
        schema={pricingSchema}
        keywords='precio api claude chile, costo gpt-5.6, claude sonnet precio, api anthropic barata, cursor precio token'
      />

      <div className='container mx-auto max-w-6xl px-4 py-16'>
        {/* Hero */}
        <div className='mb-16 text-center'>
          <h1 className='mb-4 text-4xl font-bold tracking-tight md:text-5xl'>
            Precios Transparentes
          </h1>
          <p className='text-muted-foreground mx-auto max-w-2xl text-lg'>
            Paga solo por lo que usas. Hasta <strong>77% más barato</strong> que los precios
            oficiales. Sin suscripciones mensuales.
          </p>
          <div className='mt-6 flex flex-wrap items-center justify-center gap-3 text-sm'>
            <div className='flex items-center gap-2'>
              <Check className='text-green-600 size-5' />
              <span>Precio por millón de tokens (USD / 1M)</span>
            </div>
            <div className='flex items-center gap-2'>
              <Check className='text-green-600 size-5' />
              <span>Paga en CLP o USDT</span>
            </div>
            <div className='flex items-center gap-2'>
              <Check className='text-green-600 size-5' />
              <span>Saldo no vence</span>
            </div>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {models.map((model, i) => (
            <div
              key={i}
              className='bg-card group relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all duration-300 hover:shadow-lg'
            >
              {/* Savings Badge */}
              <div className='absolute right-4 top-4 rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-600 dark:text-green-400'>
                -{model.savings}
              </div>

              {/* Model Name */}
              <h3 className='mb-4 text-xl font-bold'>{model.name}</h3>

              {/* Pricing */}
              <div className='mb-6 space-y-2'>
                <div className='flex items-baseline justify-between'>
                  <span className='text-muted-foreground text-sm'>Oficial</span>
                  <span className='text-muted-foreground text-lg line-through'>
                    {model.official}
                  </span>
                </div>
                <div className='flex items-baseline justify-between'>
                  <span className='text-sm font-medium'>Resuelve-API</span>
                  <span className='text-primary text-3xl font-bold'>{model.price}</span>
                </div>
                {model.cache && (
                  <div className='border-border/50 flex items-baseline justify-between border-t pt-2'>
                    <span className='text-muted-foreground text-xs'>Con caché</span>
                    <span className='text-primary text-sm font-semibold'>{model.cache}</span>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className='space-y-2'>
                {model.features.map((feature, j) => (
                  <li key={j} className='flex items-start gap-2 text-sm'>
                    <Check className='text-primary mt-0.5 size-4 shrink-0' />
                    <span className='text-muted-foreground'>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ Schema for SEO */}
        <div className='bg-muted/30 mt-16 rounded-xl border p-8'>
          <h2 className='mb-6 text-2xl font-bold'>Preguntas Frecuentes sobre Precios</h2>
          <div className='space-y-4'>
            <div>
              <h3 className='mb-2 font-semibold'>
                ¿Por qué es más barato que la API oficial?
              </h3>
              <p className='text-muted-foreground text-sm'>
                Agrupamos demanda corporativa por volumen y optimizamos con Prompt Caching
                nativo, reduciendo el costo por token hasta un 77%.
              </p>
            </div>
            <div>
              <h3 className='mb-2 font-semibold'>¿Cómo funcionan los precios con caché?</h3>
              <p className='text-muted-foreground text-sm'>
                En editores como Cursor o Cline, gran parte del código se reutiliza desde caché,
                pagando solo $0.070 por millón de tokens en lugar de $0.70.
              </p>
            </div>
            <div>
              <h3 className='mb-2 font-semibold'>¿Puedo pagar en pesos chilenos?</h3>
              <p className='text-muted-foreground text-sm'>
                Sí, aceptamos Webpay Plus, Cuenta RUT, Redcompra y transferencias locales vía
                Flow. También USDT para pagos internacionales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
