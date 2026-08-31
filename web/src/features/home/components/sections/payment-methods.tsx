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
import { CreditCard, Globe, DollarSign } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function PaymentMethods() {
  const { t } = useTranslation()

  const methods = [
    {
      icon: <span className='text-2xl'>🇨🇱</span>,
      title: t('payment.chile.title'),
      description: t('payment.chile.desc'),
      badge: 'Webpay Plus',
      color: 'blue',
    },
    {
      icon: <Globe className='size-6' />,
      title: t('payment.latam.title'),
      description: t('payment.latam.desc'),
      badge: 'USDT / Crypto',
      color: 'purple',
    },
    {
      icon: <DollarSign className='size-6' />,
      title: t('payment.usd.title'),
      description: t('payment.usd.desc'),
      badge: 'USD / 1M',
      color: 'green',
    },
  ]

  return (
    <section className='py-20'>
      <div className='container mx-auto max-w-6xl px-4'>
        {/* Section Header */}
        <div className='mb-12 text-center'>
          <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400'>
            <CreditCard className='size-3.5' />
            Métodos de Pago
          </div>
          <h2 className='text-3xl font-bold tracking-tight md:text-4xl'>
            Paga como prefieras
          </h2>
          <p className='text-muted-foreground mx-auto mt-3 max-w-2xl'>
            Soportamos pagos locales en Chile y pagos internacionales con USDT
          </p>
        </div>

        {/* Payment Cards */}
        <div className='grid gap-6 md:grid-cols-3'>
          {methods.map((method, i) => (
            <div
              key={i}
              className='bg-card group relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:shadow-lg'
            >
              {/* Icon */}
              <div
                className={`mb-4 flex size-12 items-center justify-center rounded-lg bg-${method.color}-500/10 text-${method.color}-600 dark:text-${method.color}-400`}
              >
                {method.icon}
              </div>

              {/* Badge */}
              <div className='mb-3 inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium'>
                {method.badge}
              </div>

              {/* Title */}
              <h3 className='mb-2 text-lg font-semibold'>{method.title}</h3>

              {/* Description */}
              <p className='text-muted-foreground text-sm leading-relaxed'>
                {method.description}
              </p>

              {/* Hover effect */}
              <div className='bg-primary/5 absolute inset-x-0 bottom-0 h-1 translate-y-1 transition-transform group-hover:translate-y-0' />
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className='bg-muted/50 mt-8 rounded-xl border p-6 text-center'>
          <p className='text-muted-foreground text-sm'>
            💳 <strong>Cuenta RUT, Débito, Transferencia</strong> vía Flow (Chile) •
            🪙 <strong>USDT TRC20, BSC, Binance Pay</strong> (Internacional) •
            💵 <strong>Saldo nunca vence</strong> •
            ⚡ <strong>Sin comisiones ocultas</strong>
          </p>
        </div>
      </div>
    </section>
  )
}
