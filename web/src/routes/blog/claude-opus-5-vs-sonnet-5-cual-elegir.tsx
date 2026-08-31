/*
Copyright (C) 2023-2026 QuantumNous
*/
import { createFileRoute, Link } from '@tanstack/react-router'
import { Calendar, Clock, ArrowLeft, Check } from 'lucide-react'

import { PublicLayout } from '@/components/layout'
import { SEO } from '@/components/seo'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/blog/claude-opus-5-vs-sonnet-5-cual-elegir')({
  component: ArticleClaudeComparison,
})

function ArticleClaudeComparison() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Claude Opus 5 vs Sonnet 5: ¿Cuál es mejor para tu proyecto?',
    datePublished: '2026-08-30',
    dateModified: '2026-08-30',
    author: {
      '@type': 'Person',
      name: 'Equipo Resuelve-API',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Resuelve-API',
      logo: {
        '@type': 'ImageObject',
        url: 'https://resuelve-api.lat/logo.png',
      },
    },
    description:
      'Comparativa práctica entre Claude Opus 5 y Sonnet 5 basada en experiencia real de desarrollo',
  }

  return (
    <PublicLayout>
      <SEO
        title='Claude Opus 5 vs Sonnet 5: ¿Cuál elegir? | Comparativa 2026'
        description='Comparativa práctica entre Claude Opus 5 y Sonnet 5. Experiencia real usando ambos modelos en proyectos de desarrollo, precios y cuándo usar cada uno.'
        canonical='/blog/claude-opus-5-vs-sonnet-5-cual-elegir'
        schema={schema}
        keywords='claude opus 5 vs sonnet 5, comparar claude modelos, cual claude usar, opus vs sonnet desarrollo'
      />

      <article className='container mx-auto max-w-3xl px-4 py-16'>
        {/* Back link */}
        <Link
          to='/blog'
          className='text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors'
        >
          <ArrowLeft className='size-4' />
          Volver al blog
        </Link>

        {/* Header */}
        <header className='mb-8'>
          <div className='mb-4 flex flex-wrap items-center gap-3 text-sm'>
            <span className='text-primary rounded-full bg-primary/10 px-3 py-1 font-medium'>
              Guías
            </span>
            <div className='text-muted-foreground flex items-center gap-1'>
              <Calendar className='size-4' />
              30 de agosto, 2026
            </div>
            <div className='text-muted-foreground flex items-center gap-1'>
              <Clock className='size-4' />8 min de lectura
            </div>
          </div>

          <h1 className='mb-4 text-4xl font-bold leading-tight md:text-5xl'>
            Claude Opus 5 vs Sonnet 5: ¿Cuál es mejor para tu proyecto?
          </h1>

          <p className='text-muted-foreground text-lg'>
            Llevo 3 meses usando ambos modelos diariamente en Cursor y Cline. Acá te cuento la
            diferencia real, sin marketing, y cuándo usar cada uno.
          </p>
        </header>

        {/* Content */}
        <div className='prose prose-lg dark:prose-invert max-w-none'>
          <h2>La diferencia que nadie te cuenta</h2>
          <p>
            Todos los artículos que leí antes me decían lo mismo: "Opus es más inteligente pero
            más caro, Sonnet es más rápido pero menos capaz". Pero eso no me ayudaba a decidir
            cuándo usar cada uno en mi día a día.
          </p>
          <p>
            Después de gastar como $200 probando ambos en proyectos reales (desde scrapers hasta
            apps con Next.js), acá va lo que realmente importa:
          </p>

          <h2>Cuándo usar Claude Opus 5</h2>
          <p>Uso Opus cuando necesito que Claude entienda código complejo o tome decisiones que requieren contexto profundo:</p>

          <ul>
            <li>
              <strong>Refactors grandes:</strong> Cuando tengo que reestructurar varios archivos y
              mantener consistencia, Opus entiende las dependencias mejor. Sonnet a veces pierde el
              hilo.
            </li>
            <li>
              <strong>Debuggear bugs raros:</strong> Si un error no tiene sentido y necesito que
              Claude "piense", Opus es brutal. Una vez me salvó de un race condition que llevaba
              días sin encontrar.
            </li>
            <li>
              <strong>Arquitectura de sistema:</strong> Para diseñar la estructura de un proyecto
              nuevo o decidir entre patrones, Opus da respuestas más pensadas.
            </li>
            <li>
              <strong>Code reviews:</strong> Cuando quiero feedback real sobre mi código, no solo
              "se ve bien". Opus encuentra edge cases que Sonnet no ve.
            </li>
          </ul>

          <p>
            <strong>Costo real:</strong> Con Resuelve-API pago $1.75 por millón de tokens. Si uso
            Cursor con prompt caching (que casi siempre se activa), baja a $0.17. O sea, una
            conversación larga me cuesta como $0.30 en promedio.
          </p>

          <h2>Cuándo usar Claude Sonnet 5</h2>
          <p>Sonnet es mi default para el 80% de mi trabajo diario:</p>

          <ul>
            <li>
              <strong>Escribir features nuevas:</strong> Para componentes de React, endpoints de
              API, queries SQL simples. Sonnet es suficiente y responde más rápido.
            </li>
            <li>
              <strong>Fixes rápidos:</strong> Bugs obvios, typos, ajustes de CSS. No necesitas
              "inteligencia profunda" para cambiar un padding.
            </li>
            <li>
              <strong>Completar código:</strong> Cuando Cursor sugiere código mientras escribo,
              Sonnet funciona perfecto. No noto diferencia vs Opus acá.
            </li>
            <li>
              <strong>Documentación:</strong> Para escribir READMEs, comentarios, o explicar qué
              hace una función. Sonnet escribe bien y cuesta menos.
            </li>
          </ul>

          <p>
            <strong>Costo real:</strong> $0.70 por millón ($0.07 con caché). Una sesión típica de
            Cursor donde estoy escribiendo features me cuesta como $0.10-0.15.
          </p>

          <h2>Mi setup actual (lo que funciona)</h2>
          <p>Tengo ambos configurados en Cursor:</p>

          <div className='bg-muted not-prose my-6 rounded-lg p-4'>
            <p className='mb-2 text-sm font-medium'>Configuración en Cursor:</p>
            <ul className='space-y-1 text-sm'>
              <li>• <strong>Default:</strong> Claude Sonnet 5 (día a día)</li>
              <li>• <strong>Cmd+K:</strong> Cambio manual a Opus cuando lo necesito</li>
              <li>• <strong>Costo mensual:</strong> ~$35 USD usando ambos (antes pagaba $150 en Anthropic directo)</li>
            </ul>
          </div>

          <h2>La diferencia de velocidad importa más de lo que pensé</h2>
          <p>
            Al principio pensé que la velocidad era irrelevante. Pero cuando estás en flow y Cursor
            te devuelve una respuesta de Sonnet en 2-3 segundos vs 8-10 de Opus, sí se nota.
          </p>
          <p>
            Para cosas simples, esperar 10 segundos por una respuesta de Opus te saca del ritmo. Y
            honestamente, el 70% de mis queries no necesitan "el modelo más inteligente".
          </p>

          <h2>¿Vale la pena Opus si eres freelance/indie?</h2>
          <p>
            Si cobras por hora o trabajas en proyectos complejos: <strong>sí, 100%</strong>. El
            tiempo que me ahorra Opus encontrando bugs o sugiriendo arquitectura correcta paga su
            costo en 5 minutos.
          </p>
          <p>
            Si estás aprendiendo o haciendo side projects: <strong>Sonnet es suficiente</strong>.
            Guarda la plata y usa Opus solo cuando te atores en algo heavy.
          </p>

          <h2>Conclusión</h2>
          <p>No es "cuál es mejor", sino cuándo usar cada uno:</p>

          <div className='bg-muted/50 not-prose my-6 rounded-lg border p-6'>
            <div className='mb-4'>
              <h3 className='mb-2 font-bold'>Claude Opus 5</h3>
              <p className='text-muted-foreground text-sm'>
                Para debugging complejo, arquitectura y refactors grandes. $1.75/M ($0.17 con
                caché).
              </p>
            </div>
            <div>
              <h3 className='mb-2 font-bold'>Claude Sonnet 5</h3>
              <p className='text-muted-foreground text-sm'>
                Para features nuevas, fixes rápidos y trabajo diario. $0.70/M ($0.07 con caché).
              </p>
            </div>
          </div>

          <p>
            Mi recomendación: empieza con Sonnet para todo. Cuando te atores en algo que Sonnet no
            puede resolver bien, ahí cambias a Opus. Con el tiempo vas a cacharte cuándo necesitas
            el upgrade.
          </p>

          <p className='text-muted-foreground text-sm italic'>
            Todos los precios son de Resuelve-API. Los oficiales de Anthropic son $3.00 (Sonnet) y
            $5.00 (Opus) por millón de tokens.
          </p>
        </div>

        {/* CTA */}
        <div className='bg-primary/5 mt-12 rounded-xl border border-primary/20 p-8 text-center'>
          <h3 className='mb-3 text-xl font-bold'>¿Quieres probar ambos modelos?</h3>
          <p className='text-muted-foreground mb-6'>
            Con Resuelve-API puedes usar Opus 5 y Sonnet 5 en Cursor pagando solo lo que usas.
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
