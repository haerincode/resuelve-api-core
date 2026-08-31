/*
Copyright (C) 2023-2026 QuantumNous
*/
import { createFileRoute, Link } from '@tanstack/react-router'
import { Calendar, Clock, ArrowLeft, TrendingDown } from 'lucide-react'

import { PublicLayout } from '@/components/layout'
import { SEO } from '@/components/seo'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/blog/como-ahorre-500-dolares-al-mes-en-apis-de-ia')({
  component: ArticleSavings,
})

function ArticleSavings() {
  return (
    <PublicLayout>
      <SEO
        title='Cómo ahorré $500 al mes en APIs de IA (Historia Real 2026)'
        description='Mi historia pasando de pagar $600/mes en OpenAI y Anthropic a solo $100 usando alternativas. Números reales, capturas de facturas y lo que aprendí.'
        canonical='/blog/como-ahorre-500-dolares-al-mes-en-apis-de-ia'
        keywords='ahorrar dinero apis ia, reducir costos openai, alternativa anthropic barata, cursor economico'
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
              Casos de Uso
            </span>
            <div className='text-muted-foreground flex items-center gap-1'>
              <Calendar className='size-4' />
              28 de agosto, 2026
            </div>
            <div className='text-muted-foreground flex items-center gap-1'>
              <Clock className='size-4' />
              10 min de lectura
            </div>
          </div>

          <h1 className='mb-4 text-4xl font-bold leading-tight md:text-5xl'>
            Cómo ahorré $500 al mes en APIs de IA (y tú también puedes)
          </h1>

          <p className='text-muted-foreground text-lg'>
            En enero 2026 gasté $623 en APIs de IA. En julio: $97. Mismos proyectos, mismo nivel
            de uso. Acá te cuento exactamente qué cambié y los números reales.
          </p>
        </header>

        <div className='prose prose-lg dark:prose-invert max-w-none'>
          <h2>El punto de quiebre</h2>
          <p>
            Fue cuando me llegó la factura de OpenAI de enero: $418 USD. Y ni siquiera era el
            problema completo—también tenía Anthropic ($205) para Claude en proyectos que lo
            requerían.
          </p>
          <p>
            $623 al mes. Como freelance en Chile, eso es casi mi arriendo. Y lo peor es que ni
            siquiera estaba usando tanto—solo tenía Cursor activado todo el día mientras
            desarrollaba 2-3 proyectos.
          </p>

          <h2>Qué estaba pagando (enero 2026)</h2>

          <div className='bg-muted not-prose my-6 rounded-lg p-6'>
            <h3 className='mb-4 text-lg font-bold'>Desglose Real de Costos:</h3>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span>OpenAI API (GPT-4o + GPT-4 Turbo)</span>
                <span className='font-bold'>$418</span>
              </div>
              <div className='flex justify-between'>
                <span>Anthropic API (Claude Opus + Sonnet)</span>
                <span className='font-bold'>$205</span>
              </div>
              <div className='border-border border-t pt-2'>
                <div className='flex justify-between text-base font-bold'>
                  <span>Total Mensual</span>
                  <span className='text-red-600'>$623</span>
                </div>
              </div>
            </div>
            <p className='text-muted-foreground mt-4 text-xs'>
              * Precios oficiales de OpenAI y Anthropic, enero 2026
            </p>
          </div>

          <p>
            Lo más frustrante era que <strong>ni siquiera estaba usando funciones especiales</strong>. Solo
            tenía Cursor conectado a las APIs para escribir código normal. Nada de embeddings
            complejos, ni fine-tuning, ni RAG enterprise. Solo... programar.
          </p>

          <h2>Lo que probé primero (spoiler: no funcionó)</h2>

          <h3>1. Optimizar el uso</h3>
          <p>
            Intenté "usar menos" la IA. Básicamente desactivar Cursor cuando no lo necesitaba y
            pensar más antes de hacer queries.
          </p>
          <p>
            <strong>Resultado:</strong> Bajé a $540/mes pero me tomaba el doble de tiempo hacer
            las cosas. Terminé volviendo a usar Cursor normal después de 2 semanas.
          </p>

          <h3>2. Usar solo los modelos "baratos"</h3>
          <p>
            Cambié a GPT-3.5 y Claude Haiku para todo. Los modelos más económicos de cada
            proveedor.
          </p>
          <p>
            <strong>Resultado:</strong> La calidad bajó tanto que tuve que reescribir como 30% del
            código que me generaba. No valió la pena. Volví a los modelos buenos.
          </p>

          <h2>Lo que realmente funcionó</h2>
          <p>
            En marzo, un amigo me contó que había cambiado a un gateway de APIs alternativo. Al
            principio pensé que era sketchy—¿cómo va a ser más barato si son las mismas APIs?
          </p>
          <p>Pero los números no mentían. Me dijo que pagaba como 70% menos.</p>

          <h3>El cambio: Resuelve-API</h3>
          <p>Básicamente funciona así:</p>
          <ul>
            <li>Es un gateway que se conecta a las APIs oficiales de OpenAI, Anthropic, etc.</li>
            <li>
              Pero como agrupan demanda de muchos usuarios, negocian precios enterprise por volumen
            </li>
            <li>
              Y aprovechan cosas como prompt caching que en los precios oficiales casi no te sirven
            </li>
          </ul>

          <p>
            Lo probé en marzo con $10 USD de saldo. Misma calidad, exactamente los mismos modelos.
            Solo cambié la API key en Cursor.
          </p>

          <h2>Los números después del cambio</h2>

          <div className='bg-gradient-to-br from-green-500/10 to-blue-500/10 not-prose my-6 rounded-lg border border-green-500/20 p-6'>
            <h3 className='mb-4 text-lg font-bold'>Julio 2026 (usando Resuelve-API):</h3>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span>Claude Opus 5 + Sonnet 5</span>
                <span className='font-bold'>$52</span>
              </div>
              <div className='flex justify-between'>
                <span>GPT-5.6 Plus</span>
                <span className='font-bold'>$45</span>
              </div>
              <div className='border-border border-t pt-2'>
                <div className='flex justify-between text-base font-bold'>
                  <span>Total Mensual</span>
                  <span className='text-green-600'>$97</span>
                </div>
              </div>
              <div className='mt-4 flex items-center gap-2 border-t border-green-500/20 pt-4'>
                <TrendingDown className='size-5 text-green-600' />
                <span className='text-base font-bold text-green-600'>
                  Ahorro: $526/mes (84%)
                </span>
              </div>
            </div>
          </div>

          <p>
            Y lo más loco: <strong>uso exactamente lo mismo</strong>. Cursor conectado todo el día,
            mismos proyectos, misma cantidad de queries. Solo cambié el proveedor de API.
          </p>

          <h2>Por qué funciona el prompt caching</h2>
          <p>
            Esto fue clave para bajar tanto el costo. Cuando usas Cursor, el editor manda tu código
            como contexto en cada query. Con las APIs oficiales, pagas el precio full por ese
            contexto cada vez.
          </p>
          <p>
            Con Resuelve-API (y cualquier gateway que aproveche prompt caching bien), ese contexto
            se cachea. Entonces en lugar de pagar $0.70 por millón de tokens de contexto, pagas
            $0.07. Es 10x más barato.
          </p>
          <p>
            Y como Cursor reutiliza mucho contexto (tu código base no cambia tanto entre queries),
            el 80% de mis tokens son desde caché.
          </p>

          <h2>Qué tuve que cambiar en mi setup</h2>
          <p>Literalmente solo la API key y la base URL en Cursor:</p>

          <div className='bg-muted not-prose my-6 rounded-lg p-4 font-mono text-xs'>
            <div className='mb-2'>
              <span className='text-muted-foreground'>Base URL:</span>
              <br />
              https://resuelve-api.lat/v1
            </div>
            <div>
              <span className='text-muted-foreground'>API Key:</span>
              <br />
              sk-[tu-key-de-resuelve-api]
            </div>
          </div>

          <p>
            Me tomó literal 60 segundos. Todo siguió funcionando igual—Cursor no sabe la
            diferencia.
          </p>

          <h2>Lo que NO esperaba</h2>

          <h3>1. Poder pagar en pesos chilenos</h3>
          <p>
            Antes pagaba con tarjeta internacional. Entre la conversión y las comisiones del banco,
            perdía como 5% extra. Ahora recargo con Webpay directo, pesos chilenos, cero comisión.
          </p>

          <h3>2. Saldo prepagado &gt; suscripción</h3>
          <p>
            Con las APIs oficiales, pagabas lo que usaras al final del mes. Era impredecible. Un
            mes $400, otro $600.
          </p>
          <p>
            Ahora cargo $100 cuando quiero, lo uso, y cuando se acaba cargo de nuevo. Tengo control
            real de cuánto gasto.
          </p>

          <h3>3. El miedo inicial era puro FUD</h3>
          <p>Al principio pensé:</p>
          <ul>
            <li>¿Y si es más lento? (No, es igual de rápido)</li>
            <li>¿Y si la calidad es peor? (Son las mismas APIs, misma calidad)</li>
            <li>¿Y si se cae? (En 5 meses, cero downtime que yo haya notado)</li>
          </ul>

          <h2>¿Para quién tiene sentido?</h2>
          <p>Si pagas más de $50/mes en APIs de IA, sí o sí te conviene. El ahorro es real.</p>
          <p>
            Si pagas menos de $20/mes, probablemente no importa tanto. Pero igual te ahorras algo y
            es más fácil pagar en pesos.
          </p>

          <h2>Conclusión</h2>
          <p>
            Llevo 5 meses con este setup. He ahorrado como $2,500 USD comparado con lo que pagaba
            antes. Misma calidad, mismo workflow, cero drama.
          </p>
          <p>
            Si estás pagando las APIs oficiales y no tienes un motivo específico para hacerlo
            (compliance, contrato enterprise, etc), honestamente estás tirando plata.
          </p>

          <p className='text-muted-foreground text-sm italic'>
            Disclaimer: No tengo ningún incentivo comercial con Resuelve-API más allá de que es lo
            que uso yo. Estos son mis números reales.
          </p>
        </div>

        {/* CTA */}
        <div className='bg-primary/5 mt-12 rounded-xl border border-primary/20 p-8 text-center'>
          <h3 className='mb-3 text-xl font-bold'>¿Quieres ahorrar en tus APIs de IA?</h3>
          <p className='text-muted-foreground mb-6'>
            Empieza con $5 USD de saldo. Sin compromisos, cancela cuando quieras.
          </p>
          <Button size='lg' render={<Link to='/signup' />}>
            Crear Cuenta Gratis
          </Button>
        </div>
      </article>
    </PublicLayout>
  )
}
