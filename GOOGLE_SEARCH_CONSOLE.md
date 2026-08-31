# 📊 Configuración de Google Search Console

## Paso 1: Verificar el dominio

1. Ve a [Google Search Console](https://search.google.com/search-console)
2. Haz clic en "Agregar propiedad"
3. Selecciona "Dominio" e ingresa: `resuelve-api.lat`
4. Google te dará un registro TXT para agregar en tu DNS

### Agregar registro TXT en tu DNS:
```
Tipo: TXT
Nombre: @
Valor: google-site-verification=XXXXXXXXXXXXXX
TTL: 3600
```

5. Espera 10-15 minutos y haz clic en "Verificar"

## Paso 2: Enviar Sitemap

Una vez verificado el dominio:

1. En Search Console, ve a "Sitemaps" (sidebar izquierdo)
2. Agrega la URL del sitemap: `https://resuelve-api.lat/sitemap.xml`
3. Haz clic en "Enviar"

## Paso 3: Solicitar indexación de páginas clave

Ve a "Inspección de URLs" y solicita indexación de:

- `https://resuelve-api.lat/` (Homepage)
- `https://resuelve-api.lat/pricing`
- `https://resuelve-api.lat/docs/cursor`
- `https://resuelve-api.lat/claude-barato-chile`
- `https://resuelve-api.lat/cursor-api-economica`
- `https://resuelve-api.lat/blog`
- `https://resuelve-api.lat/blog/claude-opus-5-vs-sonnet-5-cual-elegir`
- `https://resuelve-api.lat/blog/como-ahorre-500-dolares-al-mes-en-apis-de-ia`

## Paso 4: Monitorear Keywords

Después de 7-10 días, revisa en "Rendimiento":

### Keywords objetivo (primeras 4 semanas):
- claude opus 5 barato
- claude sonnet 5 chile
- api openai chile
- cursor api economica
- gpt-5.6 plus precio

### Métricas a monitorear:
- **Clics**: Tráfico real desde Google
- **Impresiones**: Cuántas veces apareces en búsquedas
- **CTR**: % de clics vs impresiones (objetivo: >3%)
- **Posición promedio**: Objetivo <10 en primeros 60 días

## Paso 5: Corregir errores

Revisa "Cobertura" semanalmente:
- ❌ Errores 404
- ⚠️ Páginas excluidas
- ✅ Páginas indexadas correctamente

## Expectativas realistas

### Semana 1-2:
- Google empieza a crawlear el sitio
- Primeras impresiones en keywords long-tail

### Semana 3-4:
- Apareces en búsquedas pero posición 20-50
- CTR bajo (<1%)

### Mes 2-3:
- Posición mejora a 10-20 en keywords principales
- CTR sube a 2-3%
- Primeros clics orgánicos

### Mes 4-6:
- Top 3-5 en keywords específicas (claude barato chile)
- CTR 5-10%
- Tráfico orgánico constante

## Tips para acelerar indexación

1. **Publica contenido regularmente**
   - 1 artículo nuevo cada 7-10 días
   - Actualiza landing pages con info fresca

2. **Consigue backlinks**
   - Publica en dev.to, Medium
   - Comparte en Reddit (r/programming, r/chile)
   - Sube repo a GitHub Awesome lists

3. **Promociona en redes**
   - Twitter/X con hashtags #AI #Chile #Cursor
   - LinkedIn posts técnicos
   - Discord de devs chilenos

4. **Internal linking**
   - Cada artículo debe linkear a 2-3 landing pages
   - Landing pages deben linkearse entre sí

## Contacto

Si tienes problemas con la verificación: contacto@resuelve-api.lat
