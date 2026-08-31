/*
Copyright (C) 2023-2026 QuantumNous
*/
import { createFileRoute, Link } from '@tanstack/react-router'
import { Zap, DollarSign, Code2 } from 'lucide-react'

import { PublicLayout } from '@/components/layout'
import { SEO } from '@/components/seo'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/cursor-api-economica')({
  component: CursorAPIEconomica,
})

function CursorAPIEconomica() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Cómo reducir costos de Cursor con API económica',
    description:
      'Guía para usar Claude Sonnet 5 en Cursor pagando hasta 77% menos con Resuelve-API',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Registrarse en Resuelve-API',
        text: 'Crea cuenta gratuita en resuelve-api.lat',
      },
      {
        '@type': 'HowToStep',
        name: 'Generar API Key',
        text: 'Obtén tu clave API desde el panel',
      },
      {
        '@type': 'HowToStep',
        name: 'Configurar Cursor',
        text: 'Ingresa base URL https://resuelve-api.lat/v1 y tu API key en Settings',
      },
    ],
  }

  const savings = [
    {
      scenario: 'Developer freelance',
      usage: '50M tokens/mes',
      official: '$150',
      ours: '$35',
      saved: '$115/mes',
    },
    {
      scenario: 'Startup (3 devs)',
      usage: '200M tokens/mes',
      official: '$600',
      ours: '$140',
      saved: '$460/mes',
    },
    {
      scenario: 'Empresa (10 devs)',
      usage: '800M tokens/mes',
      official: '$2,400',
      ours: '$560',
      saved: '$1,840/mes',
    },
  ]

  return (
    <PublicLayout>
      <SEO
        title='API Económica para Cursor Chile | Ahorra 77% en Claude Opus 5'
        description='Reduce costos de Cursor hasta 77%. API de Claude Opus 5 y Sonnet 5 desde $0.70 por millón. Paga en pesos con Webpay. Compatible con Cursor, Cline y VS Code.'
        canonical='/cursor-api-economica'
        schema={schema}
        keywords='cursor api barata, cursor claude opus economico, api cursor chile, reducir costo cursor, cursor webpay, gpt-5.6 plus cursor'
      />

      <div className='container mx-auto max-w-6xl px-4 py-16'>
        {/* Hero */}
        <div className='mb-16 text-center'>
          <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400'>
            <Zap className='size-3.5' />
            Para desarrolladores en Chile
          </div>
          <h1 className='mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl'>
            API Económica para Cursor
          </h1>
          <p className='text-muted-foreground mx-auto mb-6 max-w-3xl text-lg md:text-xl'>
            Usa <strong>Claude Opus 5, Sonnet 5 y GPT-5.6 Plus en Cursor</strong> pagando hasta{' '}
            <strong>77% menos</strong>. Compatible 100%, configura en 1 minuto.
          </p>
          <div className='flex flex-wrap justify-center gap-3'>
            <Button size='lg' render={<Link to='/docs/cursor' />}>
              Ver Guía de Configuración
            </Button>
            <Button size='lg' variant='outline' render={<Link to='/signup' />}>
              Crear Cuenta Gratis
            </Button>
          </div>
        </div>

        {/* Savings Calculator */}
        <section className='bg-card mb-16 rounded-xl border p-8'>
          <h2 className='mb-6 text-2xl font-bold'>
            <DollarSign className='mb-1 mr-2 inline size-6' />
            Cuánto ahorras según tu uso
          </h2>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='border-b'>
                <tr>
                  <th className='pb-3'>Perfil</th>
                  <th className='pb-3 text-right'>Uso mensual</th>
                  <th className='pb-3 text-right'>Precio oficial</th>
                  <th className='pb-3 text-right'>Con Resuelve-API</th>
                  <th className='pb-3 text-right'>Ahorras</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {savings.map((row, i) => (
                  <tr key={i}>
                    <td className='py-3 font-medium'>{row.scenario}</td>
                    <td className='text-muted-foreground py-3 text-right'>{row.usage}</td>
                    <td className='text-muted-foreground py-3 text-right line-through'>
                      {row.official}
                    </td>
                    <td className='text-primary py-3 text-right font-bold'>{row.ours}</td>
                    <td className='py-3 text-right font-bold text-green-600'>{row.saved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className='text-muted-foreground mt-4 text-xs'>
            * Cálculo basado en Claude Sonnet 5 ($3.00 oficial vs $0.70 Resuelve-API). Con prompt
            caching el ahorro es mayor (hasta 90%).
          </p>
        </section>

        {/* Why it's cheaper */}
        <section className='mb-16'>
          <h2 className='mb-6 text-2xl font-bold'>¿Por qué es más económico?</h2>
          <div className='grid gap-6 md:grid-cols-3'>
            <div className='bg-card rounded-xl border p-6'>
              <div className='mb-3 flex size-12 items-center justify-center rounded-lg bg-blue-500/10 text-2xl'>
                📦
              </div>
              <h3 className='mb-2 font-bold'>Acceso Mayorista</h3>
              <p className='text-muted-foreground text-sm'>
                Agrupamos demanda corporativa y negociamos precios enterprise por volumen con
                Anthropic y OpenAI.
              </p>
            </div>
            <div className='bg-card rounded-xl border p-6'>
              <div className='mb-3 flex size-12 items-center justify-center rounded-lg bg-purple-500/10 text-2xl'>
                ⚡
              </div>
              <h3 className='mb-2 font-bold'>Prompt Caching</h3>
              <p className='text-muted-foreground text-sm'>
                Cursor reutiliza contexto del código desde caché, reduciendo el costo por llamada
                hasta 90%.
              </p>
            </div>
            <div className='bg-card rounded-xl border p-6'>
              <div className='mb-3 flex size-12 items-center justify-center rounded-lg bg-green-500/10 text-2xl'>
                💰
              </div>
              <h3 className='mb-2 font-bold'>Sin Sobrecostos</h3>
              <p className='text-muted-foreground text-sm'>
                Cero comisiones ocultas. Paga en pesos con Webpay o USDT. Saldo prepagado sin
                suscripciones.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className='bg-muted/30 mb-16 rounded-xl border p-8'>
          <h2 className='mb-6 text-2xl font-bold'>Resuelve-API vs Cursor Subscription</h2>
          <div className='grid gap-6 md:grid-cols-2'>
            <div>
              <h3 className='mb-3 flex items-center gap-2 font-semibold'>
                <Code2 className='size-5' />
                Cursor Pro ($20/mes)
              </h3>
              <ul className='space-y-2 text-sm'>
                <li className='text-muted-foreground'>✗ 500 requests/mes limitados</li>
                <li className='text-muted-foreground'>✗ Pago mensual fijo (uses o no)</li>
                <li className='text-muted-foreground'>✗ Necesitas tarjeta internacional</li>
                <li className='text-muted-foreground'>✗ Sin control de costos</li>
              </ul>
            </div>
            <div>
              <h3 className='mb-3 flex items-center gap-2 font-semibold text-primary'>
                <Zap className='size-5' />
                Resuelve-API (Pay-as-you-go)
              </h3>
              <ul className='space-y-2 text-sm'>
                <li className='text-green-600'>✓ Sin límites de requests</li>
                <li className='text-green-600'>✓ Paga solo lo que usas</li>
                <li className='text-green-600'>✓ Webpay, Cuenta RUT o USDT</li>
                <li className='text-green-600'>✓ Monitoreo de gastos en tiempo real</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className='text-center'>
          <div className='bg-gradient-to-br from-primary/10 to-purple-500/10 inline-block rounded-xl border p-8'>
            <h2 className='mb-3 text-2xl font-bold'>Reduce tus costos de Cursor hoy</h2>
            <p className='text-muted-foreground mb-6 max-w-lg'>
              Configura en 60 segundos. Sin compromisos. Cancela cuando quieras.
            </p>
            <div className='flex flex-wrap justify-center gap-3'>
              <Button size='lg' render={<Link to='/signup' />}>
                Crear Cuenta Gratis
              </Button>
              <Button size='lg' variant='outline' render={<Link to='/docs/cursor' />}>
                Leer Guía
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
