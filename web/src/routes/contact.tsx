import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Mail, MessageSquare } from 'lucide-react'

function ContactPage() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('Contact')}</h1>
        <p className="text-muted-foreground text-lg">
          {t('Get in touch with our support team')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Live Chat */}
        <div className="border rounded-lg p-8 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <MessageSquare className="size-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold">{t('Live Chat')}</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            {t('Chat with our support team in real-time. Available for authenticated users.')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('Look for the chat widget in the bottom right corner when logged in.')}
          </p>
        </div>

        {/* Email Support */}
        <div className="border rounded-lg p-8 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Mail className="size-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-semibold">{t('Email Support')}</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            {t('Send us an email and we\'ll respond within 24 hours.')}
          </p>
          <a
            href="mailto:soporte@resuelve-api.lat"
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            soporte@resuelve-api.lat
          </a>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})
