/*
Copyright (C) 2023-2026 QuantumNous
*/
import { createFileRoute, Link } from '@tanstack/react-router'
import { Calendar, Clock, ArrowLeft, Zap } from 'lucide-react'

import { PublicLayout } from '@/components/layout'
import { SEO } from '@/components/seo'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/blog/cursor-vs-github-copilot-2026')({
  component: ArticleCursorVsCopilot,
})

function ArticleCursorVsCopilot() {
  return (
    <PublicLayout>
      <SEO
        title='Cursor vs GitHub Copilot 2026: ¿Cuál uso después de 6 meses?'
        description='Probé Cursor y GitHub Copilot durante 6 meses cada uno. Mi experiencia real, costos comparados y cuál terminé usando para desarrollo diario en 2026.'
        canonical='/blog/cursor-vs-github-copilot-2026'
        keywords='cursor vs copilot, cursor o copilot 2026, github copilot alternativa, cursor precio'
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
              Comparativas
            </span>
            <div className='text-muted-foreground flex items-center gap-1'>
              <Calendar className='size-4' />
              25 de agosto, 2026
            </div>
            <div className='text-muted-foreground flex items-center gap-1'>
              <Clock className='size-4' />
              12 min de lectura
            </div>
          </div>

          <h1 className='mb-4 text-4xl font-bold leading-tight md:text-5xl'>
            Cursor vs GitHub Copilot en 2026: ¿Cuál uso después de 6 meses?
          </h1>

          <p className='text-muted-foreground text-lg'>
            Usé GitHub Copilot de enero a junio, y Cursor de julio a diciembre. Acá te cuento cuál
            terminé dejando, por qué, y cuánto me cuesta cada uno.
          </p>
        </header>

        <div className='prose prose-lg dark:prose-invert max-w-none'>
          <h2>TL;DR para los apurados</h2>
          <p>
            <strong>Uso Cursor.</strong> GitHub Copilot es bueno para completar líneas y
            snippets, pero Cursor entiende proyectos completos. El chat integrado con Claude Opus 5
            me ahorra horas comparado con copy-paste desde ChatGPT.
          </p>
          <p>
            <strong>Costo:</strong> Copilot $10/mes. Cursor gratis + APIs de IA ~$35/mes con
            Resuelve-API. Pago más pero produzco el triple.
          </p>

          <h2>Lo que probé con GitHub Copilot (6 meses)</h2>
          <p>
            Empecé 2026 con Copilot. Lo había usado en 2024-2025 y funcionaba bien para mi
            workflow: escribir React, algo de backend en Node, fixes rápidos.
          </p>

          <h3>Lo que me gustaba de Copilot:</h3>
          <ul>
            <li>
              <strong>Súper rápido:</strong> Las sugerencias aparecen casi instantáneas. Tab, tab,
              tab y el código fluye.
            </li>
            <li>
              <strong>Barato:</strong> $10/mes flat. No importa cuánto lo uses, siempre pagas lo
              mismo.
            </li>
            <li>
              <strong>Funciona en todos los editores:</strong> VS Code, Neovim, JetBrains. Lo que
              uses, Copilot está ahí.
            </li>
            <li>
              <strong>Buenos en loops:</strong> Si estás escribiendo código repetitivo (mapear
              arrays, escribir tests similares), Copilot te ahorra mucho tiempo.
            </li>
          </ul>

          <h3>Lo que me frustraba:</h3>
          <ul>
            <li>
              <strong>No entiende el proyecto completo:</strong> Copilot ve el archivo actual y
              tal vez algunos imports. Si necesitas que entienda la arquitectura del proyecto o
              cómo interactúan varios archivos, no puede.
            </li>
            <li>
              <strong>El chat es medio inútil:</strong> GitHub agregó un chat en VS Code, pero
              honestamente prefería copy-paste desde ChatGPT. El chat de Copilot me daba respuestas
              muy genéricas.
            </li>
            <li>
              <strong>Refactors son un problema:</strong> Si quieres cambiar algo en 5 archivos a
              la vez, Copilot no te ayuda. Tienes que hacerlo manual archivo por archivo.
            </li>
          </ul>

          <h2>El switch a Cursor (julio 2026)</h2>
          <p>
            Un amigo me insistió que probara Cursor. Le dije "ya tengo Copilot, para qué cambiar".
            Me dijo "pruébalo una semana, si no te gusta vuelves".
          </p>
          <p>A los 3 días ya había cancelado Copilot.</p>

          <h3>Lo que cambió con Cursor:</h3>

          <h4>1. El chat realmente sirve</h4>
          <p>
            Con Cursor (usando Claude Opus 5 o Sonnet 5), puedo decir "el login no está funcionando,
            ayúdame a debuggear" y Cursor:
          </p>
          <ul>
            <li>Lee todos los archivos relevantes (componente, API route, esquema DB)</li>
            <li>Entiende el flujo completo</li>
            <li>Me da una respuesta específica a mi código, no genérica</li>
          </ul>
          <p>
            Con Copilot tenía que copy-paste mi código a ChatGPT y explicar el contexto. Con Cursor
            el contexto ya está cargado.
          </p>

          <h4>2. Cmd+K es magia</h4>
          <p>
            Selecciono código, aprieto Cmd+K, escribo "cambia esto para que use TypeScript
            strict", y Cursor edita el código en el lugar. No me da un snippet para copy-paste—lo
            cambia directamente.
          </p>
          <p>Para refactors esto es BRUTAL. Ahorras horas.</p>

          <h4>3. Entiende proyectos grandes</h4>
          <p>
            Trabajo en un proyecto Next.js con como 200 archivos. Con Copilot, si quería agregar un
            feature nuevo que tocaba varios componentes, era manual.
          </p>
          <p>
            Con Cursor, le digo "agrega dark mode a toda la app" y me genera los cambios en
            theme provider, componentes, y config. Todo de una.
          </p>

          <h2>Lo que NO me gusta de Cursor</h2>
          <p>Porque no todo es perfecto:</p>

          <ul>
            <li>
              <strong>Más caro:</strong> Cursor es gratis pero necesitas pagar las APIs
              separadamente. Con mi uso (~$35/mes en Resuelve-API), gasto más que los $10 de
              Copilot.
            </li>
            <li>
              <strong>Solo funciona en Cursor:</strong> Si usas VS Code o Neovim y no quieres
              cambiar de editor, Cursor no es opción. Es su propio editor (fork de VS Code).
            </li>
            <li>
              <strong>A veces es "demasiado":</strong> Cuando solo quiero autocompletar una línea
              rápido, Cursor puede ser overkill. Copilot era más lightweight para eso.
            </li>
          </ul>

          <h2>Los números reales</h2>

          <div className='bg-muted not-prose my-6 rounded-lg p-6'>
            <h3 className='mb-4 text-lg font-bold'>Costos Mensuales Comparados:</h3>
            <div className='space-y-4'>
              <div>
                <h4 className='mb-2 font-semibold'>GitHub Copilot</h4>
                <div className='space-y-1 text-sm'>
                  <div className='flex justify-between'>
                    <span>Suscripción</span>
                    <span className='font-bold'>$10/mes</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Total</span>
                    <span className='font-bold'>$10/mes</span>
                  </div>
                </div>
              </div>

              <div className='border-t pt-4'>
                <h4 className='mb-2 font-semibold'>Cursor + Resuelve-API</h4>
                <div className='space-y-1 text-sm'>
                  <div className='flex justify-between'>
                    <span>Cursor (editor)</span>
                    <span className='font-bold'>$0</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>APIs (Claude + GPT)</span>
                    <span className='font-bold'>~$35/mes</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Total</span>
                    <span className='font-bold'>$35/mes</span>
                  </div>
                </div>
              </div>
            </div>
            <p className='text-muted-foreground mt-4 text-xs'>
              * Cursor tiene planes Pro ($20/mes con créditos incluidos), yo uso el plan Free +
              mis propias APIs
            </p>
          </div>

          <h2>¿Vale la pena pagar 3.5x más?</h2>
          <p>Para mí, sí. Porque:</p>

          <ul>
            <li>
              <strong>Termino proyectos más rápido:</strong> Lo que antes me tomaba 8 horas, ahora
              lo hago en 5-6. El chat con contexto del proyecto es un game-changer.
            </li>
            <li>
              <strong>Menos contexto switching:</strong> Antes saltaba entre VS Code, ChatGPT,
              docs, de vuelta a VS Code. Ahora todo está en Cursor.
            </li>
            <li>
              <strong>Refactors grandes son viables:</strong> Con Copilot evitaba refactors
              complejos porque era mucho trabajo manual. Con Cursor, los hago sin miedo.
            </li>
          </ul>

          <p>
            Si cobras por proyecto o por hora, el ROI es obvio. Pago $25 extra al mes pero entrego
            proyectos 30% más rápido. Haz la cuenta.
          </p>

          <h2>¿Cuándo usar cada uno?</h2>

          <h3>Usa GitHub Copilot si:</h3>
          <ul>
            <li>Tu trabajo es principalmente escribir código línea por línea</li>
            <li>No necesitas IA para entender contexto complejo del proyecto</li>
            <li>Quieres la opción más barata y simple</li>
            <li>Usas un editor que no es VS Code (Copilot funciona en más lugares)</li>
          </ul>

          <h3>Usa Cursor si:</h3>
          <ul>
            <li>Trabajas en proyectos grandes con muchos archivos relacionados</li>
            <li>Haces refactors, debugging complejo, o cambios que tocan múltiples archivos</li>
            <li>Quieres un chat que realmente entienda tu código</li>
            <li>No te molesta cambiar de editor (o ya usas VS Code)</li>
          </ul>

          <h2>Mi setup actual (diciembre 2026)</h2>
          <p>Uso Cursor 90% del tiempo. Configurado con:</p>

          <ul>
            <li>Claude Sonnet 5 para trabajo diario (rápido y barato)</li>
            <li>Claude Opus 5 para debugging y arquitectura (cuando necesito "pensar")</li>
            <li>GPT-5.6 Plus para código multimodal (cuando trabajo con imágenes)</li>
          </ul>

          <p>
            Pago ~$35/mes en APIs vía Resuelve-API (vs $150+ que costaría con APIs oficiales). Mi
            productividad subió notablemente vs la época de Copilot.
          </p>

          <h2>Conclusión</h2>
          <p>
            Si estás contento con Copilot, no hay drama en quedarte. Es bueno para lo que hace.
          </p>
          <p>
            Pero si alguna vez pensaste "ojalá Copilot entendiera mi proyecto completo" o "ojalá
            pudiera pedirle a la IA que refactore esto", prueba Cursor una semana.
          </p>
          <p>Yo no volví.</p>
        </div>

        {/* CTA */}
        <div className='bg-primary/5 mt-12 rounded-xl border border-primary/20 p-8 text-center'>
          <h3 className='mb-3 text-xl font-bold'>¿Quieres probar Cursor con APIs económicas?</h3>
          <p className='text-muted-foreground mb-6'>
            Configura Cursor con Resuelve-API y paga 77% menos que con las APIs oficiales.
          </p>
          <div className='flex flex-wrap justify-center gap-3'>
            <Button size='lg' render={<Link to='/signup' />}>
              Crear Cuenta Gratis
            </Button>
            <Button size='lg' variant='outline' render={<Link to='/docs/cursor' />}>
              Ver Guía de Cursor
            </Button>
          </div>
        </div>
      </article>
    </PublicLayout>
  )
}
