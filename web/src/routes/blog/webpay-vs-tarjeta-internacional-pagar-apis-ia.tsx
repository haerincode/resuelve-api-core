/*
Copyright (C) 2023-2026 QuantumNous
*/
import { createFileRoute, Link } from '@tanstack/react-router'
import { Calendar, Clock, ArrowLeft, CreditCard } from 'lucide-react'

import { PublicLayout } from '@/components/layout'
import { SEO } from '@/components/seo'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/blog/webpay-vs-tarjeta-internacional-pagar-apis-ia')({
  component: ArticleWebpay,
})

function ArticleWebpay() {
  return (
    <PublicLayout>
      <SEO
        title='Webpay vs Tarjeta Internacional: Pagar APIs de IA desde Chile 2026'
        description='Mi experiencia de 2 años pagando APIs con tarjeta internacional vs Webpay. Cuánto ahorré en comisiones y por qué cambié a pagos locales en Chile.'
        canonical='/blog/webpay-vs-tarjeta-internacional-pagar-apis-ia'
        keywords='webpay apis ia chile, pagar openai chile, cuenta rut apis, tarjeta internacional comisiones'
      />

      <article className='container mx-auto max-w-3xl px-4 py-16'>
        <Link
          to='/blog'
          className='text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm'
        >
          <ArrowLeft className='size-4' />
          Volver al blog
        </Link>

        <header className='mb-8'>
          <div className='mb-4 flex flex-wrap items-center gap-3 text-sm'>
            <span className='text-primary rounded-full bg-primary/10 px-3 py-1 font-medium'>
              Chile
            </span>
            <div className='text-muted-foreground flex items-center gap-1'>
              <Calendar className='size-4' />
              22 de agosto, 2026
            </div>
            <div className='text-muted-foreground flex items-center gap-1'>
              <Clock className='size-4' />6 min de lectura
            </div>
          </div>

          <h1 className='mb-4 text-4xl font-bold leading-tight md:text-5xl'>
            Webpay vs Tarjeta Internacional: Mi experiencia pagando APIs de IA desde Chile
          </h1>

          <p className='text-muted-foreground text-lg'>
            Después de 2 años pagando APIs con tarjeta internacional, cambié a Webpay. Te cuento
            cuánto me ahorré en comisiones y por qué debería importarte si vives en Chile.
          </p>
        </header>

        <div className='prose prose-lg dark:prose-invert max-w-none'>
          <h2>El problema que no sabía que tenía</h2>
          <p>
            Durante 2024 y parte de 2025, pagué OpenAI y Anthropic con mi tarjeta de crédito
            internacional. Funcionaba bien—me llegaba el cobro a fin de mes, lo pagaba, y listo.
          </p>
          <p>Hasta que revisé las comisiones.</p>

          <h2>Las comisiones ocultas (que no son tan ocultas)</h2>
          <p>Cada vez que pagas en dólares con tarjeta chilena, pagas:</p>

          <ol>
            <li>
              <strong>La conversión del banco:</strong> El dólar no es al precio de mercado. El
              banco te lo vende como $20-30 más caro que el dólar observado.
            </li>
            <li>
              <strong>Comisión por transacción internacional:</strong> Algunos bancos cobran 3-4%
              extra por usar la tarjeta fuera de Chile.
            </li>
            <li>
              <strong>IVA:</strong> 19% sobre el servicio digital (esto no lo evitas, es ley).
            </li>
          </ol>

          <h3>Un ejemplo real de mi cartola</h3>

          <div className='bg-muted not-prose my-6 rounded-lg p-6'>
            <h4 className='mb-4 font-bold'>Cobro OpenAI - Marzo 2025</h4>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span>Monto en USD</span>
                <span className='font-mono'>$150.00</span>
              </div>
              <div className='flex justify-between'>
                <span>Conversión (dólar banco: $965)</span>
                <span className='font-mono'>$144,750</span>
              </div>
              <div className='flex justify-between'>
                <span>Comisión internacional (3.5%)</span>
                <span className='font-mono'>$5,066</span>
              </div>
              <div className='flex justify-between'>
                <span>IVA (19%)</span>
                <span className='font-mono'>$27,502</span>
              </div>
              <div className='border-t border-border pt-2'>
                <div className='flex justify-between font-bold'>
                  <span>Total en mi cartola</span>
                  <span className='font-mono text-red-600'>$177,318</span>
                </div>
              </div>
            </div>
            <p className='text-muted-foreground mt-4 text-xs'>
              Dólar observado ese día: $942. Diferencia: $23 por dólar.
            </p>
          </div>

          <p>
            O sea, pagué $27,318 extra por comisiones y conversión. Casi 20% más del monto real.
          </p>

          <h2>El switch a Webpay (marzo 2026)</h2>
          <p>
            Cuando cambié a Resuelve-API, una de las cosas que más me llamó la atención era que
            podía pagar con Webpay. En pesos. Directo desde mi cuenta.
          </p>
          <p>Pensé "bueno, pero al final pago lo mismo, solo cambia el método".</p>
          <p>No.</p>

          <h3>Lo que cambió con pagos locales:</h3>

          <h4>1. Cero comisión internacional</h4>
          <p>
            Pago con Webpay desde mi cuenta corriente o Cuenta RUT. El banco no cobra nada extra
            porque es una transacción local, en pesos, dentro de Chile.
          </p>

          <h4>2. No hay conversión con sobreprecio</h4>
          <p>
            Resuelve-API me muestra cuánto voy a pagar en pesos chilenos antes de confirmar. La
            conversión es transparente y al tipo de cambio del día, sin markup oculto del banco.
          </p>

          <h4>3. IVA incluido (esto no cambia)</h4>
          <p>
            Igual pago IVA (19%) porque es obligatorio en Chile para servicios digitales. Pero al
            menos no pago comisiones encima del IVA.
          </p>

          <h2>Los números comparados</h2>

          <div className='bg-muted not-prose my-6 rounded-lg p-6'>
            <h4 className='mb-4 font-bold'>Mismo monto, diferentes métodos de pago:</h4>
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <h5 className='mb-2 font-semibold'>Con Tarjeta Internacional</h5>
                <div className='space-y-1 text-sm'>
                  <div className='flex justify-between'>
                    <span>Monto USD</span>
                    <span>$100</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Conversión banco</span>
                    <span>$96,500</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Comisión 3.5%</span>
                    <span>$3,378</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>IVA 19%</span>
                    <span>$18,335</span>
                  </div>
                  <div className='border-t pt-1 font-bold'>
                    <div className='flex justify-between'>
                      <span>Total CLP</span>
                      <span className='text-red-600'>$118,213</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className='mb-2 font-semibold'>Con Webpay (Resuelve-API)</h5>
                <div className='space-y-1 text-sm'>
                  <div className='flex justify-between'>
                    <span>Monto USD</span>
                    <span>$100</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Conversión mercado</span>
                    <span>$94,200</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Comisión</span>
                    <span>$0</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>IVA 19%</span>
                    <span>$17,898</span>
                  </div>
                  <div className='border-t pt-1 font-bold'>
                    <div className='flex justify-between'>
                      <span>Total CLP</span>
                      <span className='text-green-600'>$112,098</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-4 border-t pt-4 text-center font-bold text-green-600'>
              Ahorro: $6,115 CLP por cada $100 USD
            </div>
          </div>

          <h2>En un año, cuánto ahorré</h2>
          <p>
            Entre marzo y diciembre 2026, recargué aproximadamente $800 USD en APIs. Con tarjeta
            internacional habría pagado como $945,000 CLP total. Con Webpay pagué $897,000.
          </p>
          <p>
            <strong>Ahorro real: ~$48,000 CLP al año.</strong>
          </p>
          <p>
            No es una fortuna, pero es suficiente para pagar Netflix, Spotify y Disney+ por un año.
            Plata que antes le estaba regalando al banco.
          </p>

          <h2>Otras opciones de pago local</h2>
          <p>Además de Webpay, Resuelve-API acepta:</p>

          <ul>
            <li>
              <strong>Cuenta RUT:</strong> Si no tienes tarjeta de crédito, funciona perfecto. Es
              lo que uso yo ahora.
            </li>
            <li>
              <strong>Redcompra (débito):</strong> Directo desde tu cuenta corriente.
            </li>
            <li>
              <strong>Transferencia bancaria:</strong> Si prefieres no usar tarjetas online.
            </li>
          </ul>

          <p>Todo procesado por Flow, que es el sistema que usan la mayoría de e-commerce chilenos.</p>

          <h2>¿Y si necesito pagar internacionalmente?</h2>
          <p>
            Resuelve-API también acepta USDT (Tether, la stablecoin). Si tienes cripto, puedes
            pagar así. El tipo de cambio es 1:1 con el dólar (porque USDT = $1 USD).
          </p>
          <p>
            Esto es útil si ya tienes cripto o si vives fuera de Chile pero no quieres usar tarjeta
            internacional.
          </p>

          <h2>Conclusión</h2>
          <p>
            Si vives en Chile y pagas APIs de IA con tarjeta internacional, estás perdiendo plata
            en cada transacción. Entre 5-8% en comisiones y conversión que podrías evitar.
          </p>
          <p>
            No es que Webpay sea mágico—simplemente evitas las comisiones de transacción
            internacional y pagas al tipo de cambio real. Eso suma.
          </p>
          <p>
            Cambié en marzo y en 9 meses ahorré como $45,000 pesos. Lo suficiente para que me
            importe.
          </p>

          <p className='text-muted-foreground text-sm italic'>
            Nota: Los cálculos son aproximados y basados en mi banco (Santander). Tu banco puede
            tener comisiones diferentes, pero el punto se mantiene—siempre pagas más con tarjeta
            internacional.
          </p>
        </div>

        {/* CTA */}
        <div className='bg-primary/5 mt-12 rounded-xl border border-primary/20 p-8 text-center'>
          <h3 className='mb-3 text-xl font-bold'>¿Quieres pagar APIs en pesos chilenos?</h3>
          <p className='text-muted-foreground mb-6'>
            Crea tu cuenta en Resuelve-API y recarga con Webpay, Cuenta RUT o transferencia.
          </p>
          <Button size='lg' render={<Link to='/signup' />}>
            Crear Cuenta Gratis
          </Button>
        </div>
      </article>
    </PublicLayout>
  )
}
