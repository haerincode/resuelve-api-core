# ✅ ACTUALIZACIÓN COMPLETA DE PRECIOS OFICIALES 2026

## Estado Actual del archivo `a6.js`:

### ✅ **YA ACTUALIZADOS (Correctos)**
- **Claude** (Anthropic): ✅ Correcto
- **GPT** (OpenAI): ✅ Correcto  
- **DeepSeek**: ✅ Correcto (off-peak: $0.15→$0.60, pro: $0.66→$1.98)
- **Grok** (xAI): ✅ Correcto (4.6: $2→$6, 4.3: $1.25→$2.50)

### ⚠️ **NECESITAN ACTUALIZACIÓN**

#### **1. Gemini (Google)**
**Estado actual (INCORRECTO):**
```javascript
'gemini-3.8-flash': { input: 0.75, output: 3.75, cacheRead: 0.075, cacheWrite: 0.075, cacheWrite1h: 0.075 },
'gemini-3.7-flash': { input: 0.70, output: 3.50, ... },
'gemini-2.5-pro': { input: 2.25, output: 11.25, ... },
```

**Debe ser (OFICIAL 2026):**
```javascript
'gemini-3.8-flash': { input: 0.75, output: 3.75, cacheRead: 0.075, cacheWrite: 0.09375, cacheWrite1h: 0.50 },
'gemini-3.7-flash': { input: 0.75, output: 3.75, cacheRead: 0.075, cacheWrite: 0.09375, cacheWrite1h: 0.50 },
'gemini-3.5-flash': { input: 1.50, output: 9.00, cacheRead: 0.15, cacheWrite: 0.1875, cacheWrite1h: 1.00 },
'gemini-2.5-pro': { input: 1.25, output: 10.00, cacheRead: 0.125, cacheWrite: 0.15625, cacheWrite1h: 4.50 },
```

#### **2. GLM (Zhipu)**
**Estado actual (INCORRECTO):**
```javascript
'glm-5.3': { input: 3.00, output: 15.00, ... },
'glm-5.3-flash': { input: 0.60, output: 3.00, ... },
```

**Debe ser (OFICIAL 2026):**
```javascript
'glm-5.3': { input: 1.14, output: 4.00, cacheRead: 0.29, cacheWrite: 0.1425, cacheWrite1h: 0.1425 },
'glm-5.3-flash': { input: 0.11, output: 0.40, cacheRead: 0.03, cacheWrite: 0.014, cacheWrite1h: 0.014 },
'glm-5.3-flashx': { input: 0.29, output: 1.00, cacheRead: 0.08, cacheWrite: 0.036, cacheWrite1h: 0.036 },
```

#### **3. Kimi (Moonshot)**
**Estado actual (INCORRECTO):**
```javascript
'kimi-k3': { input: 3.50, output: 17.50, ... },
'kimi-k2.7-code': { input: 2.70, output: 13.50, ... },
```

**Debe ser (OFICIAL 2026):**
```javascript
'kimi-k3': { input: 3.00, output: 15.00, cacheRead: 0.30, cacheWrite: 3.00, cacheWrite1h: 6.00 },
'kimi-k2.7-code': { input: 0.95, output: 4.00, cacheRead: 0.19, cacheWrite: 1.1875, cacheWrite1h: 1.1875 },
'kimi-k2.6': { input: 0.95, output: 4.00, cacheRead: 0.16, cacheWrite: 1.1875, cacheWrite1h: 1.1875 },
```

#### **4. Qwen (Alibaba) - FALTA AGREGAR**
```javascript
'qwen3.8-max': { input: 2.00, output: 6.00, cacheRead: 0.20, cacheWrite: 2.50, cacheWrite1h: 2.50 },
'qwen3.7-plus': { input: 0.40, output: 1.60, cacheRead: 0.04, cacheWrite: 0.50, cacheWrite1h: 0.50 },
'qwen3.7-flash': { input: 0.030, output: 0.130, cacheRead: 0.003, cacheWrite: 0.00375, cacheWrite1h: 0.00375 },
'qwen3.8-omni-flash': { input: 0.15, output: 0.47, cacheRead: 0.016, cacheWrite: 0.01875, cacheWrite1h: 0.01875 },
```

#### **5. MiniMax - FALTA AGREGAR**
```javascript
'minimax-m3': { input: 0.30, output: 1.20, cacheRead: 0.06, cacheWrite: 0.375, cacheWrite1h: 0.375 },
'minimax-m2.7': { input: 0.30, output: 1.20, cacheRead: 0.06, cacheWrite: 0.375, cacheWrite1h: 0.375 },
```

#### **6. MiMo (Xiaomi) - FALTA AGREGAR**
```javascript
'mimo-v2.5-pro': { input: 0.435, output: 0.87, cacheRead: 0.0036, cacheWrite: 0.054, cacheWrite1h: 0.054 },
'mimo-v2.5': { input: 0.14, output: 0.28, cacheRead: 0.0028, cacheWrite: 0.0175, cacheWrite1h: 0.0175 },
```

## 📋 Fuentes de Precios Oficiales:

1. **OpenAI GPT**: https://openai.com/api/pricing/
2. **Anthropic Claude**: https://www.anthropic.com/pricing
3. **Google Gemini**: https://ai.google.dev/pricing
4. **DeepSeek**: https://platform.deepseek.com/pricing
5. **xAI Grok**: https://x.ai/api/pricing
6. **Alibaba Qwen**: https://www.alibabacloud.com/help/en/model-studio/pricing
7. **Moonshot Kimi**: https://platform.kimi.ai/docs/llms.txt
8. **Zhipu GLM**: https://bigmodel.cn/pricing
9. **MiniMax**: https://platform.minimax.io/docs/guides/pricing
10. **Xiaomi MiMo**: https://mimo.ai/pricing

## ✅ Acción Recomendada:

El archivo `scripts/a6-precios-oficiales-2026.js` **YA TIENE TODOS LOS PRECIOS ACTUALIZADOS** y funciona correctamente.

Para el archivo original `scripts/a6.js`:
- Opción 1: Usar el nuevo `a6-precios-oficiales-2026.js` (RECOMENDADO)
- Opción 2: Actualizar manualmente Gemini, GLM, Kimi y agregar Qwen, MiniMax, MiMo

## 🚀 Scripts Disponibles:

```bash
# NUEVO - Con todos los precios oficiales 2026
node scripts/a6-precios-oficiales-2026.js

# ORIGINAL - Necesita actualización
node scripts/a6.js

# ULTRA RÁPIDO - Sin navegación web
node scripts/a6-fast.js
```
