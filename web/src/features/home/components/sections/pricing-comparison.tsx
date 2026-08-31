/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { TrendingDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function PricingComparison() {
  const { t } = useTranslation()

  const pricingData = [
    {
      model: 'Claude Sonnet 5',
      official: '$3.00',
      ours: '$0.70',
      cache: '$0.070',
      savings: '77%',
    },
    {
      model: 'Claude Opus 5',
      official: '$5.00',
      ours: '$1.75',
      cache: '$0.170',
      savings: '65%',
    },
    {
      model: 'GPT-5.6 Sol',
      official: '$2.50',
      ours: '$0.50',
      cache: null,
      savings: '80%',
    },
    {
      model: 'GPT-5.6 Terra',
      official: '$2.50',
      ours: '$0.14',
      cache: null,
      savings: '94%',
    },
  ]

  return (
    <section className='border-border/40 bg-muted/30 relative overflow-hidden border-y py-20'>
      {/* Background gradient */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5' />

      <div className='container relative mx-auto max-w-6xl px-4'>
        {/* Section Header */}
        <div className='mb-12 text-center'>
          <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400'>
            <TrendingDown className='size-3.5' />
            {t('pricing.why.title')}
          </div>
          <h2 className='text-3xl font-bold tracking-tight md:text-4xl'>
            Hasta 77% más barato que los precios oficiales
          </h2>
          <p className='text-muted-foreground mx-auto mt-3 max-w-2xl'>
            Mismos modelos, misma calidad, sin sobreprecio corporativo
          </p>
        </div>

        {/* Pricing Grid */}
        <div className='mb-12 grid gap-4 md:grid-cols-2'>
          {pricingData.map((item, i) => (
            <div
              key={i}
              className='bg-card hover:border-primary/30 group relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:shadow-lg'
            >
              {/* Savings badge */}
              <div className='absolute right-4 top-4 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-bold text-green-600 dark:text-green-400'>
                -{item.savings}
              </div>

              <h3 className='mb-4 text-lg font-semibold'>{item.model}</h3>

              <div className='space-y-2'>
                <div className='flex items-baseline justify-between'>
                  <span className='text-muted-foreground text-sm'>Oficial</span>
                  <span className='text-muted-foreground text-lg line-through'>
                    {item.official}
                  </span>
                </div>
                <div className='flex items-baseline justify-between'>
                  <span className='text-sm font-medium'>Resuelve-API</span>
                  <span className='text-primary text-2xl font-bold'>{item.ours}</span>
                </div>
                {item.cache && (
                  <div className='border-border/50 flex items-baseline justify-between border-t pt-2'>
                    <span className='text-muted-foreground text-xs'>Con caché</span>
                    <span className='text-primary text-sm font-semibold'>{item.cache}</span>
                  </div>
                )}
              </div>

              <p className='text-muted-foreground mt-3 text-xs'>
                Precio por millón de tokens (USD / 1M)
              </p>
            </div>
          ))}
        </div>

        {/* Why cheaper */}
        <div className='bg-card rounded-xl border p-6 md:p-8'>
          <h3 className='mb-6 text-xl font-semibold'>¿Por qué es más barato?</h3>
          <div className='grid gap-4 md:grid-cols-3'>
            <div>
              <div className='mb-2 flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400'>
                <span className='text-xl font-bold'>1</span>
              </div>
              <h4 className='mb-1 font-semibold'>Acceso Mayorista</h4>
              <p className='text-muted-foreground text-sm'>
                Agrupamos demanda y nos conectamos a infraestructura enterprise por volumen
              </p>
            </div>
            <div>
              <div className='mb-2 flex size-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400'>
                <span className='text-xl font-bold'>2</span>
              </div>
              <h4 className='mb-1 font-semibold'>Prompt Caching Real</h4>
              <p className='text-muted-foreground text-sm'>
                En editores como Cursor, el código se lee desde caché, reduciendo el costo hasta 90%
              </p>
            </div>
            <div>
              <div className='mb-2 flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400'>
                <span className='text-xl font-bold'>3</span>
              </div>
              <h4 className='mb-1 font-semibold'>Pay-As-You-Go</h4>
              <p className='text-muted-foreground text-sm'>
                Cero mensualidades fijas de $20. Cargas cuando necesitas y el saldo no vence
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
