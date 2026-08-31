/*
Copyright (C) 2023-2026 QuantumNous
*/
import { createFileRoute, Link } from '@tanstack/react-router'
import { Check, ArrowRight, DollarSign } from 'lucide-react'

import { PublicLayout } from '@/components/layout'
import { SEO } from '@/components/seo'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/claude-barato-chile')({
  component: ClaudeBaratoChile,
})

function ClaudeBaratoChile() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Dónde comprar API de Claude Sonnet barata en Chile?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Resuelve-API ofrece Claude Sonnet 5 desde $0.70 USD por millón de tokens (77% más barato que Anthropic). Puedes pagar con Webpay, Cuenta RUT o USDT.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cómo pagar Claude con pesos chilenos?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'En Resuelve-API puedes recargar saldo prepagado usando Webpay Plus, Cuenta RUT, Redcompra o transferencia bancaria local vía Flow, sin necesidad de tarjeta internacional.',
        },
      },
    ],
  }

  return (
    <PublicLayout>
      <SEO
        title='Claude Opus 5 y Sonnet 5 Barato Chile | API desde $0.70 con Webpay'
        description='Compra API de Claude Opus 5 y Sonnet 5 en Chile con 77% descuento. Paga en pesos con Webpay, Cuenta RUT o USDT. Ideal para Cursor, Cline y desarrollo con IA.'
        canonical='/claude-barato-chile'
        schema={schema}
        keywords='claude opus 5 barato, claude sonnet 5 chile, api claude precio chile, comprar claude webpay, claude pesos chilenos, anthropic chile'
      />

      <div className='container mx-auto max-w-6xl px-4 py-16'>
        {/* Hero */}
        <div className='mb-16'>
          <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400'>
            <DollarSign className='size-3.5' />
            77% más barato
          </div>
          <h1 className='mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl'>
            Claude Opus 5 y Sonnet 5 Barato
            <br />
            <span className='text-primary'>en Chile 🇨🇱</span>
          </h1>
          <p className='text-muted-foreground mb-6 max-w-3xl text-lg md:text-xl'>
            Accede a <strong>Claude Opus 5, Sonnet 5 y todos los modelos de Anthropic</strong> con
            hasta 77% de descuento. Paga en pesos chilenos con Webpay, Cuenta RUT o USDT.
          </p>
          <div className='flex flex-wrap gap-3'>
            <Button size='lg' className='group' render={<Link to='/signup' />}>
              Crear Cuenta Gratis
              <ArrowRight className='ml-2 size-4 transition-transform group-hover:translate-x-1' />
            </Button>
            <Button size='lg' variant='outline' render={<Link to='/pricing' />}>
              Ver Precios
            </Button>
          </div>
        </div>

        {/* Comparison Table */}
        <section className='bg-card mb-16 rounded-xl border p-8'>
          <h2 className='mb-6 text-2xl font-bold'>Comparativa de Precios (por 1M tokens)</h2>
          <div className='overflow-x-auto'>
            <table className='w-full text-left'>
              <thead className='border-b'>
                <tr>
                  <th className='pb-3'>Modelo</th>
                  <th className='pb-3 text-right'>Anthropic Oficial</th>
                  <th className='pb-3 text-right'>Resuelve-API</th>
                  <th className='pb-3 text-right'>Ahorro</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                <tr>
                  <td className='py-3 font-medium'>Claude Sonnet 5</td>
                  <td className='text-muted-foreground py-3 text-right line-through'>$3.00</td>
                  <td className='text-primary py-3 text-right font-bold'>$0.70</td>
                  <td className='py-3 text-right text-green-600'>77%</td>
                </tr>
                <tr>
                  <td className='py-3 font-medium'>Claude Opus 5</td>
                  <td className='text-muted-foreground py-3 text-right line-through'>$5.00</td>
                  <td className='text-primary py-3 text-right font-bold'>$1.75</td>
                  <td className='py-3 text-right text-green-600'>65%</td>
                </tr>
                <tr>
                  <td className='py-3 font-medium'>Con Prompt Caching</td>
                  <td className='text-muted-foreground py-3 text-right'>—</td>
                  <td className='text-primary py-3 text-right font-bold'>$0.070</td>
                  <td className='py-3 text-right text-green-600'>90%+ ahorro</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Benefits */}
        <section className='mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <div className='bg-card rounded-xl border p-6'>
            <div className='mb-3 flex size-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400'>
              🇨🇱
            </div>
            <h3 className='mb-2 font-bold'>Paga en Pesos Chilenos</h3>
            <p className='text-muted-foreground text-sm'>
              Webpay Plus, Cuenta RUT, Redcompra o transferencia bancaria. Sin comisiones
              internacionales.
            </p>
          </div>
          <div className='bg-card rounded-xl border p-6'>
            <div className='mb-3 flex size-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400'>
              💎
            </div>
            <h3 className='mb-2 font-bold'>Sin Suscripciones</h3>
            <p className='text-muted-foreground text-sm'>
              Pay-as-you-go puro. Recarga $3, $5 o $10 USD cuando necesites. El saldo no vence.
            </p>
          </div>
          <div className='bg-card rounded-xl border p-6'>
            <div className='mb-3 flex size-12 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400'>
              ⚡
            </div>
            <h3 className='mb-2 font-bold'>Para Cursor y Cline</h3>
            <p className='text-muted-foreground text-sm'>
              Compatible con OpenAI API. Configura en 1 minuto. Aprovecha prompt caching nativo.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className='bg-muted/30 mb-16 rounded-xl border p-8'>
          <h2 className='mb-6 text-2xl font-bold'>Cómo empezar en 3 pasos</h2>
          <div className='space-y-4'>
            <div className='flex gap-4'>
              <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold'>
                1
              </div>
              <div>
                <h3 className='mb-1 font-semibold'>Crea tu cuenta gratis</h3>
                <p className='text-muted-foreground text-sm'>
                  Regístrate en{' '}
                  <Link to='/signup' className='text-primary hover:underline'>
                    resuelve-api.lat/signup
                  </Link>
                  . Sin tarjeta de crédito requerida.
                </p>
              </div>
            </div>
            <div className='flex gap-4'>
              <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold'>
                2
              </div>
              <div>
                <h3 className='mb-1 font-semibold'>Recarga saldo</h3>
                <p className='text-muted-foreground text-sm'>
                  Paga con Webpay, Cuenta RUT o USDT. Desde $3 USD (aprox $3.000 CLP).
                </p>
              </div>
            </div>
            <div className='flex gap-4'>
              <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold'>
                3
              </div>
              <div>
                <h3 className='mb-1 font-semibold'>Genera tu API Key</h3>
                <p className='text-muted-foreground text-sm'>
                  Copia tu clave y úsala en Cursor, Cline, VS Code o cualquier cliente compatible
                  con OpenAI.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className='mb-6 text-2xl font-bold'>Preguntas Frecuentes</h2>
          <div className='space-y-4'>
            <details className='bg-card group rounded-lg border p-4'>
              <summary className='cursor-pointer font-semibold'>
                ¿Por qué es más barato que Anthropic directo?
              </summary>
              <p className='text-muted-foreground mt-2 text-sm'>
                Agrupamos demanda corporativa y negociamos precios enterprise por volumen. Además,
                optimizamos costos con prompt caching nativo, que reduce hasta 90% el precio por
                token al reutilizar contexto.
              </p>
            </details>
            <details className='bg-card group rounded-lg border p-4'>
              <summary className='cursor-pointer font-semibold'>
                ¿Es legal usar Claude más barato?
              </summary>
              <p className='text-muted-foreground mt-2 text-sm'>
                Sí, totalmente legal. Somos un gateway técnico autorizado que distribuye acceso a
                las APIs oficiales de Anthropic. No violamos ningún TOS.
              </p>
            </details>
            <details className='bg-card group rounded-lg border p-4'>
              <summary className='cursor-pointer font-semibold'>
                ¿Necesito tarjeta internacional?
              </summary>
              <p className='text-muted-foreground mt-2 text-sm'>
                No. Puedes pagar completamente con métodos locales chilenos: Webpay Plus, Cuenta
                RUT, Redcompra o transferencia bancaria. También aceptamos USDT para usuarios
                internacionales.
              </p>
            </details>
          </div>
        </section>

        {/* CTA */}
        <section className='mt-16 text-center'>
          <div className='bg-primary/5 inline-block rounded-xl border border-primary/20 p-8'>
            <h2 className='mb-3 text-2xl font-bold'>
              Empieza a usar Claude Sonnet 5 hoy mismo
            </h2>
            <p className='text-muted-foreground mb-6'>
              Sin suscripciones. Sin compromisos. Paga solo lo que usas.
            </p>
            <Button size='lg' render={<Link to='/signup' />}>
              Crear Cuenta Gratis
            </Button>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
