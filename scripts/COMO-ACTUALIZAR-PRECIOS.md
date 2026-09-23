# 📝 CÓMO ACTUALIZAR PRECIOS EN a6.js

## ✅ El script FUNCIONA ahora (versión restaurada)

**NO TOCAR LA LÓGICA** - Solo actualizar números de precios cuando sea necesario.

---

## 📊 Precios que puedes actualizar manualmente:

### **Abrir `scripts/a6.js` y buscar estas líneas:**

#### **Gemini (línea ~44-74):**
```javascript
// ACTUAL (viejo):
'gemini-3.8-flash': { input: 0.75, output: 3.75, cacheRead: 0.075, cacheWrite: 0.075, cacheWrite1h: 0.075 },
'gemini-2.5-pro': { input: 2.25, output: 11.25, cacheRead: 0.225, cacheWrite: 2.8125, cacheWrite1h: 2.8125 },

// NUEVO (oficial 2026):
'gemini-3.8-flash': { input: 0.75, output: 3.75, cacheRead: 0.075, cacheWrite: 0.09375, cacheWrite1h: 0.50 },
'gemini-2.5-pro': { input: 1.25, output: 10.00, cacheRead: 0.125, cacheWrite: 0.15625, cacheWrite1h: 4.50 },
```

#### **Grok (línea ~76-84):**
```javascript
// ACTUAL:
'grok-4.6': { input: 4.60, output: 23.00, ... },
'grok-4.3': { input: 4.30, output: 21.50, ... },

// NUEVO:
'grok-4.6': { input: 2.00, output: 6.00, cacheRead: 0.50, cacheWrite: 2.50, cacheWrite1h: 2.50 },
'grok-4.3': { input: 1.25, output: 2.50, cacheRead: 0.20, cacheWrite: 1.5625, cacheWrite1h: 1.5625 },
```

#### **GLM (línea ~88-92):**
```javascript
// ACTUAL:
'glm-5.3': { input: 3.00, output: 15.00, ... },

// NUEVO:
'glm-5.3': { input: 1.14, output: 4.00, cacheRead: 0.29, cacheWrite: 0.1425, cacheWrite1h: 0.1425 },
'glm-5.3-flashx': { input: 0.29, output: 1.00, cacheRead: 0.08, cacheWrite: 0.036, cacheWrite1h: 0.036 },
'glm-5.3-flash': { input: 0.11, output: 0.40, cacheRead: 0.03, cacheWrite: 0.014, cacheWrite1h: 0.014 },
```

#### **Kimi (línea ~96-99):**
```javascript
// ACTUAL:
'kimi-k3': { input: 3.50, output: 17.50, ... },

// NUEVO:
'kimi-k3': { input: 3.00, output: 15.00, cacheRead: 0.30, cacheWrite: 3.00, cacheWrite1h: 6.00 },
'kimi-k2.7-code': { input: 0.95, output: 4.00, cacheRead: 0.19, cacheWrite: 0.1188, cacheWrite1h: 0.1188 },
```

#### **AGREGAR después de Kimi (línea ~100):**
```javascript
  // Qwen Models
  'qwen3.8-max': { input: 2.00, output: 6.00, cacheRead: 0.20, cacheWrite: 2.50, cacheWrite1h: 2.50 },
  'qwen3.7-flash': { input: 0.030, output: 0.130, cacheRead: 0.003, cacheWrite: 0.00375, cacheWrite1h: 0.00375 },
  'qwen3.8-omni-flash': { input: 0.15, output: 0.47, cacheRead: 0.016, cacheWrite: 0.01875, cacheWrite1h: 0.01875 },

  // MiniMax Models
  'minimax-m3': { input: 0.30, output: 1.20, cacheRead: 0.06, cacheWrite: 0.375, cacheWrite1h: 0.375 },
  'minimax-m2.7': { input: 0.30, output: 1.20, cacheRead: 0.06, cacheWrite: 0.375, cacheWrite1h: 0.375 },

  // Mimo Models
  'mimo-v2.5-pro': { input: 0.435, output: 0.87, cacheRead: 0.0036, cacheWrite: 0.054, cacheWrite1h: 0.054 },
  'mimo-v2.5': { input: 0.14, output: 0.28, cacheRead: 0.0028, cacheWrite: 0.0175, cacheWrite1h: 0.0175 },
```

---

## 🚀 **EJECUTAR:**

```bash
node scripts/a6.js
```

**El script funciona perfecto como está. Solo actualiza precios cuando los oficiales cambien.**
