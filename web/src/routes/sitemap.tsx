/*
Copyright (C) 2023-2026 QuantumNous
*/
import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sitemap')({
  component: Sitemap,
})

function Sitemap() {
  useEffect(() => {
    const baseUrl = 'https://resuelve-api.lat'
    const now = new Date().toISOString()

    const urls = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/pricing', priority: '0.9', changefreq: 'daily' },
      { loc: '/docs', priority: '0.8', changefreq: 'weekly' },
      { loc: '/about', priority: '0.7', changefreq: 'monthly' },
      { loc: '/rankings', priority: '0.6', changefreq: 'weekly' },
      { loc: '/login', priority: '0.5', changefreq: 'monthly' },
      { loc: '/signup', priority: '0.5', changefreq: 'monthly' },
    ]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(url => `  <url>
    <loc>${baseUrl}${url.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
    <xhtml:link rel="alternate" hreflang="es-CL" href="${baseUrl}${url.loc}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${url.loc}?lang=en"/>
  </url>`).join('\n')}
</urlset>`

    // Set proper content type and download
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sitemap.xml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  return (
    <div className='container mx-auto max-w-4xl px-4 py-12'>
      <h1 className='mb-4 text-2xl font-bold'>Sitemap XML</h1>
      <p className='text-muted-foreground'>
        El sitemap se ha descargado. Súbelo a la raíz de tu dominio como <code>/sitemap.xml</code>
      </p>
      <div className='bg-muted mt-6 rounded-lg p-4'>
        <h2 className='mb-2 font-semibold'>URLs incluidas:</h2>
        <ul className='list-inside list-disc space-y-1 text-sm'>
          <li>/ (Homepage)</li>
          <li>/pricing (Precios)</li>
          <li>/docs (Documentación)</li>
          <li>/about (Acerca de)</li>
          <li>/rankings (Rankings)</li>
          <li>/login (Iniciar sesión)</li>
          <li>/signup (Registro)</li>
        </ul>
      </div>
    </div>
  )
}
