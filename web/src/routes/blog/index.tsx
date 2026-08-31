/*
Copyright (C) 2023-2026 QuantumNous
*/
import { createFileRoute, Link } from '@tanstack/react-router'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

import { PublicLayout } from '@/components/layout'
import { SEO } from '@/components/seo'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/blog/')({
  component: BlogIndex,
})

const articles = [
  {
    slug: 'claude-opus-5-vs-sonnet-5-cual-elegir',
    title: 'Claude Opus 5 vs Sonnet 5: ¿Cuál es mejor para tu proyecto?',
    excerpt:
      'Comparativa práctica entre Claude Opus 5 y Sonnet 5. Te cuento mi experiencia real usando ambos modelos en proyectos de desarrollo y cuándo usar cada uno.',
    date: '2026-08-30',
    readTime: '8 min',
    category: 'Guías',
  },
  {
    slug: 'como-ahorre-500-dolares-al-mes-en-apis-de-ia',
    title: 'Cómo ahorré $500 al mes en APIs de IA (y tú también puedes)',
    excerpt:
      'Mi historia real pasando de pagar $600/mes en OpenAI y Anthropic a solo $100 usando Resuelve-API. Números reales, capturas de pantalla y todo lo que aprendí.',
    date: '2026-08-28',
    readTime: '10 min',
    category: 'Casos de Uso',
  },
  {
    slug: 'cursor-vs-github-copilot-2026',
    title: 'Cursor vs GitHub Copilot en 2026: ¿Cuál uso después de 6 meses?',
    excerpt:
      'Probé Cursor y Copilot durante 6 meses cada uno. Te cuento cuál terminé usando, por qué, y cuánto me cuesta realmente cada uno con mi setup actual.',
    date: '2026-08-25',
    readTime: '12 min',
    category: 'Comparativas',
  },
  {
    slug: 'webpay-vs-tarjeta-internacional-pagar-apis-ia',
    title: 'Webpay vs Tarjeta Internacional: Mi experiencia pagando APIs de IA desde Chile',
    excerpt:
      'Después de 2 años pagando APIs con tarjeta internacional, cambié a Webpay. Te cuento cuánto me ahorré en comisiones y por qué debería importarte si vives en Chile.',
    date: '2026-08-22',
    readTime: '6 min',
    category: 'Chile',
  },
]

function BlogIndex() {
  return (
    <PublicLayout>
      <SEO
        title='Blog de IA para Desarrolladores | Resuelve-API'
        description='Guías prácticas, comparativas honestas y casos reales sobre APIs de IA, Claude Opus 5, GPT-5.6 y desarrollo con Cursor. Escrito por devs, para devs.'
        canonical='/blog'
        keywords='blog ia desarrollo, claude opus tutorial, cursor guia, api ia chile, gpt-5.6 comparativa'
      />

      <div className='container mx-auto max-w-4xl px-4 py-16'>
        {/* Header */}
        <div className='mb-12'>
          <h1 className='mb-4 text-4xl font-bold tracking-tight md:text-5xl'>
            Blog de Resuelve-API
          </h1>
          <p className='text-muted-foreground text-lg'>
            Guías prácticas y experiencias reales usando APIs de IA. Sin marketing, solo
            contenido útil escrito por desarrolladores.
          </p>
        </div>

        {/* Articles Grid */}
        <div className='space-y-8'>
          {articles.map((article) => (
            <article
              key={article.slug}
              className='bg-card group rounded-xl border p-6 transition-all duration-300 hover:shadow-lg'
            >
              <div className='mb-3 flex items-center gap-3 text-xs'>
                <span className='text-primary rounded-full bg-primary/10 px-3 py-1 font-medium'>
                  {article.category}
                </span>
                <div className='text-muted-foreground flex items-center gap-1'>
                  <Calendar className='size-3.5' />
                  {new Date(article.date).toLocaleDateString('es-CL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className='text-muted-foreground flex items-center gap-1'>
                  <Clock className='size-3.5' />
                  {article.readTime}
                </div>
              </div>

              <Link
                to={`/blog/${article.slug}`}
                className='group-hover:text-primary mb-2 block text-2xl font-bold transition-colors'
              >
                {article.title}
              </Link>

              <p className='text-muted-foreground mb-4 leading-relaxed'>{article.excerpt}</p>

              <Link
                to={`/blog/${article.slug}`}
                className='text-primary hover:underline inline-flex items-center gap-1 text-sm font-medium'
              >
                Leer artículo completo
                <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
              </Link>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className='bg-muted/50 mt-16 rounded-xl border p-8 text-center'>
          <h2 className='mb-3 text-xl font-bold'>¿Quieres probar Resuelve-API?</h2>
          <p className='text-muted-foreground mb-6'>
            Empieza gratis. Sin suscripciones. Paga solo lo que usas.
          </p>
          <Button size='lg' render={<Link to='/signup' />}>
            Crear Cuenta Gratis
          </Button>
        </div>
      </div>
    </PublicLayout>
  )
}
