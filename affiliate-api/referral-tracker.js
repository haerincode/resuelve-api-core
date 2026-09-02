// Script para capturar referidos en landing page
// Insertar antes del </body> en la página principal

(function() {
  'use strict';

  const COOKIE_NAME = 'ref_code';
  const COOKIE_DAYS = 30;
  const PARAM_NAME = 'ref';

  // Obtener parámetro URL
  function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  // Guardar cookie
  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
  }

  // Leer cookie
  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
  }

  // Capturar ref code de URL
  const refCode = getUrlParam(PARAM_NAME);
  if (refCode && refCode.length > 0) {
    setCookie(COOKIE_NAME, refCode, COOKIE_DAYS);
    console.log('[Referral] Código guardado:', refCode);
  }

  // Inyectar ref code en formularios de registro
  function injectRefCode() {
    const existingRef = getCookie(COOKIE_NAME);
    if (!existingRef) return;

    // Buscar formularios de registro
    const forms = document.querySelectorAll('form[action*="register"], form#register-form, form.register-form');

    forms.forEach(form => {
      // Buscar campo aff_code existente
      let affInput = form.querySelector('input[name="aff_code"]');

      // Crear campo oculto si no existe
      if (!affInput) {
        affInput = document.createElement('input');
        affInput.type = 'hidden';
        affInput.name = 'aff_code';
        form.appendChild(affInput);
      }

      // Asignar valor
      affInput.value = existingRef;
      console.log('[Referral] Código inyectado en formulario:', existingRef);
    });
  }

  // Ejecutar al cargar página
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectRefCode);
  } else {
    injectRefCode();
  }

  // Re-inyectar si el DOM cambia (SPAs)
  if (window.MutationObserver) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          injectRefCode();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Exponer función para obtener ref code actual
  window.getRefCode = function() {
    return getCookie(COOKIE_NAME);
  };

})();
