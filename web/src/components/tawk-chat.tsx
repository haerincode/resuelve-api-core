import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export function TawkChat() {
  const user = useAuthStore((state) => state.auth.user);

  useEffect(() => {
    // Only load Tawk if user is authenticated
    if (!user) return;

    // Tawk.to configuration
    const Tawk_API: any = (window as any).Tawk_API || {};
    const Tawk_LoadStart = new Date();
    (window as any).Tawk_API = Tawk_API;
    (window as any).Tawk_LoadStart = Tawk_LoadStart;

    // Set user attributes
    Tawk_API.visitor = {
      name: user.username || user.email,
      email: user.email,
    };

    // Load Tawk.to script
    const s1 = document.createElement('script');
    const s0 = document.getElementsByTagName('script')[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/6aa3b78d279bff344394a954/1k27oa0th';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode?.insertBefore(s1, s0);

    // Cleanup function
    return () => {
      // Remove Tawk.to widget on unmount
      const tawkWidget = document.getElementById('tawk-widget');
      if (tawkWidget) {
        tawkWidget.remove();
      }
    };
  }, [user]);

  return null;
}
