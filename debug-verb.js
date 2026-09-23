// Diagnóstico de Verb - Ejecuta esto en la consola del navegador

// 1. Verificar si hay token en el store
const authState = window.__ZUSTAND_STORE__?.getState?.() ||
                  (await import('./stores/auth-store')).useAuthStore.getState();
console.log('Auth state:', {
  hasUser: !!authState?.auth?.user,
  userId: authState?.auth?.user?.id,
  hasToken: !!authState?.auth?.accessToken,
  tokenPreview: authState?.auth?.accessToken?.substring(0, 20) + '...'
});

// 2. Intentar llamar al endpoint manualmente
const accessToken = authState?.auth?.accessToken;
if (accessToken) {
  fetch('/api/verb-token', {
    credentials: 'same-origin',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })
  .then(r => r.json())
  .then(data => console.log('Verb token response:', data))
  .catch(err => console.error('Verb token error:', err));
} else {
  console.error('No access token found in store!');
}

// 3. Ver si Verb está configurado
console.log('Verb loaded:', !!window.Verb);
console.log('Verb config:', window.Verb);
