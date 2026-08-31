/*
Copyright (C) 2023-2026 QuantumNous
*/
import { createFileRoute } from '@tanstack/react-router'
import { Code, Copy, Check, Terminal } from 'lucide-react'
import { useState } from 'react'

import { PublicLayout } from '@/components/layout'
import { SEO } from '@/components/seo'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/docs/cursor')({
  component: CursorGuide,
})

function CursorGuide() {
  const [copied, setCopied] = useState(false)
  const apiKey = 'sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
  const baseUrl = 'https://resuelve-api.lat/v1'

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cómo usar Claude Sonnet 5 en Cursor con Resuelve-API?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'En Cursor ve a Settings -> Models -> OpenAI API Key, coloca como Base URL https://resuelve-api.lat/v1 y pega tu API Key generada en la plataforma.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Funciona el prompt caching en Cursor?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, Cursor aprovecha automáticamente el prompt caching de Claude, reduciendo el costo hasta 90% al reutilizar contexto del código.',
        },
      },
    ],
  }

  return (
    <PublicLayout>
      <SEO
        title='Cómo Usar Claude Sonnet 5 en Cursor (77% OFF) | Guía 2026'
        description='Configura Claude Sonnet 5 y Opus en Cursor en 1 minuto. Ahorra hasta 77% vs API oficial. Paga en pesos chilenos con Webpay o USDT. Guía paso a paso actualizada.'
        canonical='/docs/cursor'
        schema={faqSchema}
        keywords='cursor claude barato, como usar claude en cursor, cursor api economica, claude sonnet cursor chile, prompt caching cursor'
      />

      <div className='container mx-auto max-w-4xl px-4 py-16'>
        {/* Hero */}
        <div className='mb-12'>
          <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400'>
            <Terminal className='size-3.5' />
            Guía Oficial
          </div>
          <h1 className='mb-4 text-4xl font-bold tracking-tight md:text-5xl'>
            Configurar Claude Sonnet 5 en Cursor
          </h1>
          <p className='text-muted-foreground text-lg'>
            Ahorra hasta <strong>77% en tus costos de IA</strong> usando Resuelve-API como
            proveedor. Configuración en 60 segundos.
          </p>
        </div>

        {/* Step 1 */}
        <section className='bg-card mb-8 rounded-xl border p-6'>
          <div className='mb-4 flex items-center gap-3'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400'>
              <span className='font-bold'>1</span>
            </div>
            <h2 className='text-xl font-bold'>Obtén tu API Key en Resuelve-API</h2>
          </div>
          <ol className='text-muted-foreground ml-11 list-decimal space-y-2 text-sm'>
            <li>
              Ve a{' '}
              <a href='https://resuelve-api.lat' className='text-primary hover:underline'>
                resuelve-api.lat
              </a>{' '}
              y crea una cuenta
            </li>
            <li>Recarga saldo (desde $3 USD con Webpay o USDT)</li>
            <li>
              Ve a <strong>Panel → Claves API</strong> y genera una nueva clave
            </li>
            <li>Copia tu API Key (empieza con sk-...)</li>
          </ol>
        </section>

        {/* Step 2 */}
        <section className='bg-card mb-8 rounded-xl border p-6'>
          <div className='mb-4 flex items-center gap-3'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400'>
              <span className='font-bold'>2</span>
            </div>
            <h2 className='text-xl font-bold'>Configura Cursor</h2>
          </div>
          <div className='text-muted-foreground ml-11 space-y-4 text-sm'>
            <p>Abre Cursor y ve a:</p>
            <div className='bg-muted rounded-lg p-4 font-mono text-xs'>
              <Code className='mb-2 size-4' />
              Settings → Models → OpenAI API Key
            </div>
            <p>Ingresa los siguientes datos:</p>
            <div className='space-y-3'>
              <div>
                <label className='mb-1 block text-xs font-medium'>Base URL</label>
                <div className='bg-muted group relative flex items-center justify-between rounded-lg border p-3'>
                  <code className='text-xs'>{baseUrl}</code>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='size-8 p-0'
                    onClick={() => handleCopy(baseUrl)}
                  >
                    {copied ? (
                      <Check className='text-green-600 size-4' />
                    ) : (
                      <Copy className='size-4' />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <label className='mb-1 block text-xs font-medium'>API Key</label>
                <div className='bg-muted rounded-lg border p-3'>
                  <code className='text-xs'>{apiKey}</code>
                  <p className='text-muted-foreground mt-2 text-xs'>
                    (Pega tu clave real de Resuelve-API)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3 */}
        <section className='bg-card mb-8 rounded-xl border p-6'>
          <div className='mb-4 flex items-center gap-3'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400'>
              <span className='font-bold'>3</span>
            </div>
            <h2 className='text-xl font-bold'>Selecciona Claude Sonnet 5</h2>
          </div>
          <div className='text-muted-foreground ml-11 space-y-2 text-sm'>
            <p>En Cursor, abre el chat (Cmd/Ctrl + L) y selecciona:</p>
            <div className='bg-muted rounded-lg p-3 font-mono text-xs'>
              claude-sonnet-5-20241022
            </div>
            <p className='text-xs italic'>
              También disponibles: <strong>claude-opus-5</strong>, <strong>gpt-5.6-sol</strong>,{' '}
              <strong>gpt-5.6-terra</strong>
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className='bg-muted/30 rounded-xl border p-6'>
          <h3 className='mb-4 text-lg font-bold'>🎯 Beneficios de usar Resuelve-API</h3>
          <ul className='grid gap-3 md:grid-cols-2'>
            {[
              '77% más barato que Anthropic directo',
              'Prompt caching automático (90% ahorro adicional)',
              'Paga en pesos chilenos con Webpay',
              'Saldo prepagado sin suscripciones',
              'Sin límites de uso diario',
              'Soporte técnico en español',
            ].map((benefit, i) => (
              <li key={i} className='flex items-start gap-2 text-sm'>
                <Check className='text-green-600 mt-0.5 size-4 shrink-0' />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className='mt-12'>
          <h2 className='mb-6 text-2xl font-bold'>Preguntas Frecuentes</h2>
          <div className='space-y-4'>
            <details className='bg-card group rounded-lg border p-4'>
              <summary className='cursor-pointer font-semibold'>
                ¿Funciona el prompt caching en Cursor?
              </summary>
              <p className='text-muted-foreground mt-2 text-sm'>
                Sí, Cursor aprovecha automáticamente el prompt caching de Claude. Al editar código,
                Cursor reutiliza el contexto previo desde caché, reduciendo el costo por token hasta
                90% ($0.070 en lugar de $0.70 por millón).
              </p>
            </details>
            <details className='bg-card group rounded-lg border p-4'>
              <summary className='cursor-pointer font-semibold'>
                ¿Cuánto cuesta usar Claude en Cursor con Resuelve-API?
              </summary>
              <p className='text-muted-foreground mt-2 text-sm'>
                Claude Sonnet 5: $0.70 por millón de tokens ($0.070 con caché). Claude Opus:
                $1.75/M. Con $10 USD de saldo puedes escribir miles de líneas de código.
              </p>
            </details>
            <details className='bg-card group rounded-lg border p-4'>
              <summary className='cursor-pointer font-semibold'>
                ¿Necesito tarjeta de crédito internacional?
              </summary>
              <p className='text-muted-foreground mt-2 text-sm'>
                No. Puedes recargar con Webpay Plus, Cuenta RUT, Redcompra o USDT (cripto). Todo
                procesado en Chile.
              </p>
            </details>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
