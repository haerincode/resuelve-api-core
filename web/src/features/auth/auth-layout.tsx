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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@/components/ui/skeleton'
import { useSystemConfig } from '@/hooks/use-system-config'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading } = useSystemConfig()

  return (
    <div className='relative grid h-svh max-w-none lg:grid-cols-2'>
      {/* Logo absoluto */}
      <Link
        to='/'
        className='absolute top-4 left-4 z-20 flex items-center gap-2 transition-opacity hover:opacity-80 sm:top-8 sm:left-8'
      >
        <div className='relative h-8 w-8'>
          {loading ? (
            <Skeleton className='absolute inset-0 rounded-full' />
          ) : (
            <img
              src={logo}
              alt={t('Logo')}
              className='h-8 w-8 rounded-full object-cover'
            />
          )}
        </div>
        {loading ? (
          <Skeleton className='h-6 w-24' />
        ) : (
          <h1 className='text-xl font-medium'>{systemName}</h1>
        )}
      </Link>

      {/* Panel izquierdo - Formulario */}
      <div className='container flex items-center pt-16 sm:pt-0'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 px-4 py-8 sm:w-[420px] sm:p-8'>
          {children}
        </div>
      </div>

      {/* Panel derecho - Hero visual (solo desktop) */}
      <div className='bg-muted relative hidden overflow-hidden lg:block'>
        {/* Gradient overlay */}
        <div className='absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent' />

        {/* Grid pattern background */}
        <div className='absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]' />

        {/* Content */}
        <div className='relative flex h-full flex-col items-start justify-center px-12 text-foreground'>
          <div className='max-w-md space-y-6'>
            {/* Badge */}
            <div className='inline-flex items-center rounded-full border bg-background/50 px-3 py-1 text-xs font-medium backdrop-blur-sm'>
              <span className='mr-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse' />
              Infraestructura de IA para LatAm
            </div>

            {/* Heading */}
            <h2 className='text-4xl font-bold tracking-tight'>
              Accede a modelos{' '}
              <span className='text-primary'>de última generación</span>
            </h2>

            {/* Description */}
            <p className='text-muted-foreground text-lg leading-relaxed'>
              Gateway unificado con enrutamiento inteligente, balanceo de carga y monitoreo en tiempo real.
            </p>

            {/* Features list */}
            <ul className='space-y-3 pt-4'>
              {[
                'API compatible con OpenAI',
                'Múltiples proveedores (OpenAI, Anthropic, Google)',
                'Facturación y control de cuotas',
                'Monitoreo de latencia y uptime',
              ].map((feature, i) => (
                <li key={i} className='flex items-start gap-3 text-sm'>
                  <svg
                    className='text-primary mt-0.5 h-5 w-5 flex-shrink-0'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span className='text-muted-foreground'>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer quote */}
          <div className='mt-auto pt-12'>
            <blockquote className='border-l-2 border-primary/50 pl-4 italic text-sm text-muted-foreground'>
              "Infraestructura robusta para escalar tus aplicaciones de IA en Chile y Latinoamérica"
            </blockquote>
          </div>
        </div>

        {/* Decorative elements */}
        <div className='absolute top-1/4 right-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl' />
        <div className='absolute bottom-1/4 left-1/3 h-96 w-96 rounded-full bg-primary/3 blur-3xl' />
      </div>
    </div>
  )
}
