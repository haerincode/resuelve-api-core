/*
Copyright (C) 2023-2026 QuantumNous
*/
import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from '@tanstack/react-router'

interface AnalyticsProps {
  gaId?: string
  gtmId?: string
}

export function Analytics({ gaId = 'G-XXXXXXXXXX', gtmId = 'GTM-XXXXXXX' }: AnalyticsProps) {
  const location = useLocation()

  useEffect(() => {
    // Track pageviews on route change
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('config', gaId, {
        page_path: location.pathname,
      })
    }
  }, [location, gaId])

  return (
    <Helmet>
      {/* Google Tag Manager */}
      {gtmId && (
        <>
          <script>{`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}</script>
          <noscript>{`
            <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
            height="0" width="0" style="display:none;visibility:hidden"></iframe>
          `}</noscript>
        </>
      )}

      {/* Google Analytics 4 */}
      {gaId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
          <script>{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              cookie_flags: 'SameSite=None;Secure',
              anonymize_ip: true
            });
          `}</script>
        </>
      )}

      {/* Microsoft Clarity (optional) */}
      <script type="text/javascript">{`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "YOUR_CLARITY_ID");
      `}</script>
    </Helmet>
  )
}

// Helper to track custom events
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', eventName, params)
  }
}

// Track conversion events
export function trackConversion(eventName: string, value?: number) {
  trackEvent(eventName, {
    currency: 'USD',
    value: value || 0,
  })
}
