/*
Copyright (C) 2023-2026 QuantumNous
*/
import { useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'

interface AnalyticsProps {
  gaId?: string
  gtmId?: string
  clarityId?: string
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function injectScript(id: string, src?: string, inline?: string) {
  if (document.getElementById(id)) return
  const script = document.createElement('script')
  script.id = id
  script.async = true
  if (src) script.src = src
  if (inline) script.textContent = inline
  document.head.append(script)
}

export function Analytics({ gaId, gtmId, clarityId }: AnalyticsProps) {
  const location = useLocation()

  useEffect(() => {
    if (!gaId) return
    injectScript(
      'ga4-src',
      `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    )
    injectScript(
      'ga4-init',
      undefined,
      `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`
    )
  }, [gaId])

  useEffect(() => {
    if (!gtmId) return
    injectScript(
      'gtm-init',
      undefined,
      `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`
    )
  }, [gtmId])

  useEffect(() => {
    if (!clarityId) return
    injectScript(
      'clarity-init',
      undefined,
      `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}");`
    )
  }, [clarityId])

  useEffect(() => {
    if (!gaId || typeof window.gtag !== 'function') return
    window.gtag('config', gaId, { page_path: location.pathname })
  }, [gaId, location.pathname])

  return null
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params)
  }
}

export function trackConversion(eventName: string, value?: number) {
  trackEvent(eventName, { currency: 'USD', value: value ?? 0 })
}
