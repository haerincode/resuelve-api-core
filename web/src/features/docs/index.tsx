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
import { BookOpen, Code2, Terminal } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  CodeBlock,
  CodeBlockCopyButton,
} from '@/components/ai-elements/code-block'
import { PublicLayout } from '@/components/layout'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const BASE_URL = 'https://resuelve-api-f47v.onrender.com/v1'

type CodeLang = 'cursor' | 'claude-code' | 'python' | 'curl'

const LANG_LABELS: Record<CodeLang, string> = {
  cursor: 'Cursor',
  'claude-code': 'Claude Code',
  python: 'Python',
  curl: 'cURL',
}

function buildCursorSample(): string {
  return `// 1. Abre Cursor (Configuración > Modelos)
// 2. Cambia a "OpenAI API Compatible"
// 3. Ingresa:

Base URL: ${BASE_URL}
API Key: <TU_CLAVE_API>

// 4. Selecciona modelo:
// - claude-sonnet-4-20250514
// - claude-opus-4-20250514
// - o cualquier modelo disponible en tu panel

// 5. ¡Listo! Cursor ahora usa Resuelve-API`
}

function buildClaudeCodeSample(): string {
  return `# 1. Abre Claude Code (CLI o Desktop)
# 2. Ejecuta:

claude config set api-key <TU_CLAVE_API>
claude config set base-url ${BASE_URL}

# 3. Selecciona modelo en la sesión:
# /model claude-sonnet-4-20250514
# /model claude-opus-4-20250514

# 4. ¡Comienza a usar Claude Code con Resuelve-API!`
}

function buildPythonSample(): string {
  return `from openai import OpenAI

client = OpenAI(
    base_url="${BASE_URL}",
    api_key="<TU_CLAVE_API>",
)

completion = client.chat.completions.create(
    model="claude-sonnet-4-20250514",
    messages=[
        {"role": "user", "content": "Explica entrelazamiento cuántico en un párrafo."}
    ],
)

print(completion.choices[0].message.content)`
}

function buildCurlSample(): string {
  return `curl ${BASE_URL}/chat/completions \\
  -H "Authorization: Bearer <TU_CLAVE_API>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-sonnet-4-20250514",
    "messages": [
      {"role": "user", "content": "Explica entrelazamiento cuántico en un párrafo."}
    ]
  }'`
}

function getSample(lang: CodeLang): string {
  switch (lang) {
    case 'cursor':
      return buildCursorSample()
    case 'claude-code':
      return buildClaudeCodeSample()
    case 'python':
      return buildPythonSample()
    case 'curl':
      return buildCurlSample()
  }
}

function getHighlightLang(lang: CodeLang): 'javascript' | 'bash' | 'python' {
  if (lang === 'python') return 'python'
  if (lang === 'curl') return 'bash'
  return 'javascript'
}

export function DocsPage() {
  const { t } = useTranslation()
  const [activeLang, setActiveLang] = useState<CodeLang>('cursor')

  const code = getSample(activeLang)
  const highlightLang = getHighlightLang(activeLang)

  return (
    <PublicLayout>
      <div className='mx-auto max-w-4xl px-6 py-12'>
        {/* Header */}
        <div className='mb-8 flex items-start gap-4'>
          <div className='flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400'>
            <BookOpen className='size-6' />
          </div>
          <div>
            <h1 className='text-3xl font-bold'>
              {t('Documentación de Integración')}
            </h1>
            <p className='text-muted-foreground mt-2 text-base'>
              {t(
                'Integra Claude Sonnet 5 y Opus 5 en tus herramientas favoritas mediante Resuelve-API'
              )}
            </p>
          </div>
        </div>

        {/* Base URL Card */}
        <div className='bg-muted/30 mb-8 rounded-xl border p-5'>
          <div className='mb-2 flex items-center gap-2'>
            <Terminal className='text-muted-foreground size-4' />
            <span className='text-sm font-semibold'>
              {t('URL Base de la API')}
            </span>
          </div>
          <code className='bg-background block rounded-lg border p-3 font-mono text-sm'>
            {BASE_URL}
          </code>
        </div>

        {/* Code Samples */}
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Code2 className='text-muted-foreground size-5' />
            <h2 className='text-xl font-semibold'>
              {t('Ejemplos de Integración')}
            </h2>
          </div>

          <Tabs
            value={activeLang}
            onValueChange={(v) => setActiveLang(v as CodeLang)}
          >
            <TabsList className='bg-muted/40 h-10 p-1'>
              {(Object.keys(LANG_LABELS) as CodeLang[]).map((lang) => (
                <TabsTrigger
                  key={lang}
                  value={lang}
                  className='h-8 px-4 text-sm'
                >
                  {LANG_LABELS[lang]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className='mt-4'>
            <CodeBlock code={code} language={highlightLang}>
              <CodeBlockCopyButton />
            </CodeBlock>
          </div>

          <p className='text-muted-foreground mt-3 text-sm'>
            {t('Reemplaza')}{' '}
            <code className='bg-muted rounded px-1.5 py-0.5 font-mono text-xs'>
              {'<TU_CLAVE_API>'}
            </code>{' '}
            {t('con tu clave API desde el panel de tokens.')}
          </p>
        </div>

        {/* FAQ */}
        <div className='mt-12 space-y-6'>
          <h2 className='flex items-center gap-2 text-xl font-semibold'>
            <span>{t('Preguntas Frecuentes')}</span>
          </h2>

          <div className='space-y-4'>
            <div className='bg-muted/20 rounded-lg border p-5'>
              <h3 className='mb-2 font-semibold'>
                {t('¿Qué modelos están disponibles?')}
              </h3>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                {t(
                  'Resuelve-API soporta Claude Sonnet 5 (claude-sonnet-4-20250514), Claude Opus 5 (claude-opus-4-20250514), y otros modelos. Consulta el panel de Modelos para la lista completa.'
                )}
              </p>
            </div>

            <div className='bg-muted/20 rounded-lg border p-5'>
              <h3 className='mb-2 font-semibold'>
                {t('¿Cómo obtengo mi clave API?')}
              </h3>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                {t(
                  'Inicia sesión en tu panel, ve a la sección de Tokens/Claves y genera una nueva clave. Puedes limitar el acceso por modelo, grupo o IP.'
                )}
              </p>
            </div>

            <div className='bg-muted/20 rounded-lg border p-5'>
              <h3 className='mb-2 font-semibold'>
                {t('¿Resuelve-API es compatible con OpenAI SDK?')}
              </h3>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                {t(
                  'Sí, Resuelve-API implementa el protocolo OpenAI-compatible. Puedes usar librerías como openai-python o el SDK oficial de OpenAI simplemente cambiando la base_url.'
                )}
              </p>
            </div>

            <div className='bg-muted/20 rounded-lg border p-5'>
              <h3 className='mb-2 font-semibold'>
                {t('¿Hay límites de tasa (rate limits)?')}
              </h3>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                {t(
                  'Los límites de tasa dependen de tu grupo de token. Consulta la configuración de tu clave API en el panel para ver los límites aplicables (RPM, TPM, RPD).'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
