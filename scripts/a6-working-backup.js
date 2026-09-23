/**
 * A6 Price Scraper - MULTI-MODELO
 */

const puppeteer = require('puppeteer');

const OFFICIAL_PRICES = {
  // Claude Models
  'claude-sonnet-5': { input: 2.00, output: 10.00, cacheRead: 0.20, cacheWrite: 2.50, cacheWrite1h: 4.00 },
  'claude-sonnet-4-6': { input: 1.80, output: 9.00, cacheRead: 0.18, cacheWrite: 2.25, cacheWrite1h: 3.60 },
  'claude-opus-5': { input: 5.00, output: 25.00, cacheRead: 0.50, cacheWrite: 6.25, cacheWrite1h: 10.00 },
  'claude-opus-4-8': { input: 4.80, output: 24.00, cacheRead: 0.48, cacheWrite: 6.00, cacheWrite1h: 9.60 },
  'claude-opus-4-7': { input: 4.70, output: 23.50, cacheRead: 0.47, cacheWrite: 5.875, cacheWrite1h: 9.40 },
  'claude-opus-4-6': { input: 4.60, output: 23.00, cacheRead: 0.46, cacheWrite: 5.75, cacheWrite1h: 9.20 },
  'claude-fable-5': { input: 10.00, output: 50.00, cacheRead: 1.00, cacheWrite: 12.50, cacheWrite1h: 20.00 },
  'claude-fable-5.1': { input: 10.00, output: 50.00, cacheRead: 0.25, cacheWrite: 12.50, cacheWrite1h: 20.00 },
  'claude-haiku-4-5': { input: 0.80, output: 4.00, cacheRead: 0.08, cacheWrite: 1.00, cacheWrite1h: 1.60 },
  'claude-haiku-4-5-20251001': { input: 0.80, output: 4.00, cacheRead: 0.08, cacheWrite: 1.00, cacheWrite1h: 1.60 },

  // GPT Models
  'gpt-6-astra': { input: 10.00, output: 50.00, cacheRead: 1.00, cacheWrite: 12.50, cacheWrite1h: 12.50 },
  'gpt-5.6': { input: 5.00, output: 25.00, cacheRead: 0.50, cacheWrite: 6.25, cacheWrite1h: 6.25 },
  'gpt-5.6-sol': { input: 5.00, output: 30.00, cacheRead: 0.50, cacheWrite: 6.25, cacheWrite1h: 6.25 },
  'gpt-5.6-terra': { input: 2.50, output: 15.00, cacheRead: 0.25, cacheWrite: 3.125, cacheWrite1h: 3.125 },
  'gpt-5.6-luna': { input: 1.00, output: 6.00, cacheRead: 0.10, cacheWrite: 1.25, cacheWrite1h: 1.25 },
  'gpt-5.5': { input: 4.50, output: 22.50, cacheRead: 0.45, cacheWrite: 5.625, cacheWrite1h: 5.625 },
  'gpt-5.4': { input: 4.00, output: 20.00, cacheRead: 0.40, cacheWrite: 5.00, cacheWrite1h: 5.00 },
  'gpt-5.4-mini': { input: 0.80, output: 4.00, cacheRead: 0.08, cacheWrite: 1.00, cacheWrite1h: 1.00 },
  'gpt-5.3-codex': { input: 3.50, output: 17.50, cacheRead: 0.35, cacheWrite: 4.375, cacheWrite1h: 4.375 },
  'gpt-5.3-codex-spark': { input: 3.00, output: 15.00, cacheRead: 0.30, cacheWrite: 3.75, cacheWrite1h: 3.75 },
  'gpt-5.2': { input: 3.00, output: 15.00, cacheRead: 0.30, cacheWrite: 3.75, cacheWrite1h: 3.75 },
  'gpt-5.2-2025-12-11': { input: 3.00, output: 15.00, cacheRead: 0.30, cacheWrite: 3.75, cacheWrite1h: 3.75 },
  'gpt-4o': { input: 2.50, output: 12.50, cacheRead: 0.25, cacheWrite: 3.125, cacheWrite1h: 3.125 },
  'gpt-4o-mini': { input: 0.50, output: 2.50, cacheRead: 0.05, cacheWrite: 0.625, cacheWrite1h: 0.625 },

  // GPT Image Models
  'gpt-image-2.5-sunburst': { input: 3.00, output: 15.00, cacheRead: 0.30, cacheWrite: 3.75, cacheWrite1h: 3.75 },
  'gpt-image-2.5-flare': { input: 2.75, output: 13.75, cacheRead: 0.275, cacheWrite: 3.4375, cacheWrite1h: 3.4375 },
  'gpt-image-2.5': { input: 2.50, output: 12.50, cacheRead: 0.25, cacheWrite: 3.125, cacheWrite1h: 3.125 },
  'gpt-image-2': { input: 2.00, output: 10.00, cacheRead: 0.20, cacheWrite: 2.50, cacheWrite1h: 2.50 },
  'gpt-image-1.5': { input: 1.50, output: 7.50, cacheRead: 0.15, cacheWrite: 1.875, cacheWrite1h: 1.875 },

  // Gemini Models
  'gemini-3.8-flash': { input: 0.75, output: 3.75, cacheRead: 0.075, cacheWrite: 0.075, cacheWrite1h: 0.075 },
  'gemini-3.7-flash': { input: 0.70, output: 3.50, cacheRead: 0.070, cacheWrite: 0.070, cacheWrite1h: 0.070 },
  'gemini-3.6-flash': { input: 0.65, output: 3.25, cacheRead: 0.065, cacheWrite: 0.065, cacheWrite1h: 0.065 },
  'gemini-3.5-flash': { input: 0.60, output: 3.00, cacheRead: 0.060, cacheWrite: 0.060, cacheWrite1h: 0.060 },
  'gemini-3.5-flash-high': { input: 0.80, output: 4.00, cacheRead: 0.080, cacheWrite: 0.080, cacheWrite1h: 0.080 },
  'gemini-3.5-flash-low': { input: 0.40, output: 2.00, cacheRead: 0.040, cacheWrite: 0.040, cacheWrite1h: 0.040 },
  'gemini-3.5-flash-extra-low': { input: 0.30, output: 1.50, cacheRead: 0.030, cacheWrite: 0.030, cacheWrite1h: 0.030 },
  'gemini-3.5-flash-lite': { input: 0.35, output: 1.75, cacheRead: 0.035, cacheWrite: 0.035, cacheWrite1h: 0.035 },
  'gemini-3.1-flash-image': { input: 0.55, output: 2.75, cacheRead: 0.055, cacheWrite: 0.055, cacheWrite1h: 0.055 },
  'gemini-3.1-flash-lite-preview': { input: 0.45, output: 2.25, cacheRead: 0.045, cacheWrite: 0.045, cacheWrite1h: 0.045 },
  'gemini-3.1-pro-preview': { input: 2.00, output: 10.00, cacheRead: 0.20, cacheWrite: 0.20, cacheWrite1h: 0.20 },
  'gemini-3.1-pro-preview-low': { input: 1.50, output: 7.50, cacheRead: 0.15, cacheWrite: 0.15, cacheWrite1h: 0.15 },
  'gemini-3-pro-preview': { input: 2.50, output: 12.50, cacheRead: 0.25, cacheWrite: 0.25, cacheWrite1h: 0.25 },
  'gemini-3-pro-image-preview': { input: 2.75, output: 13.75, cacheRead: 0.275, cacheWrite: 0.275, cacheWrite1h: 0.275 },
  'gemini-3-flash-preview': { input: 0.50, output: 2.50, cacheRead: 0.050, cacheWrite: 0.050, cacheWrite1h: 0.050 },
  'gemini-3-flash-agent': { input: 0.60, output: 3.00, cacheRead: 0.060, cacheWrite: 0.060, cacheWrite1h: 0.060 },
  'gemini-2.5-pro': { input: 2.25, output: 11.25, cacheRead: 0.225, cacheWrite: 0.225, cacheWrite1h: 0.225 },
  'gemini-2.5-flash': { input: 0.55, output: 2.75, cacheRead: 0.055, cacheWrite: 0.055, cacheWrite1h: 0.055 },
  'gemini-embedding-2-preview': { input: 0.10, output: 0.50, cacheRead: 0.010, cacheWrite: 0.010, cacheWrite1h: 0.010 },
  'google-imagen-4': { input: 3.00, output: 15.00, cacheRead: 0.30, cacheWrite: 0.30, cacheWrite1h: 0.30 },

  // DeepSeek Models
  'deepseek-v4.1-flash': { input: 0.60, output: 3.00, cacheRead: 0.060, cacheWrite: 0.75, cacheWrite1h: 0.75 },
  'deepseek-v4.1-flash-expires-on-0910': { input: 0.60, output: 3.00, cacheRead: 0.060, cacheWrite: 0.75, cacheWrite1h: 0.75 },
  'deepseek-v4-pro': { input: 4.00, output: 20.00, cacheRead: 0.40, cacheWrite: 5.00, cacheWrite1h: 5.00 },
  'deepseek-v4-pro-0813': { input: 4.00, output: 20.00, cacheRead: 0.40, cacheWrite: 5.00, cacheWrite1h: 5.00 },
  'deepseek-v4-flash': { input: 0.55, output: 2.75, cacheRead: 0.055, cacheWrite: 0.6875, cacheWrite1h: 0.6875 },
  'deepseek-v4-flash-0731': { input: 0.55, output: 2.75, cacheRead: 0.055, cacheWrite: 0.6875, cacheWrite1h: 0.6875 },
  'deepseek-v4-flash-vision-exp': { input: 0.60, output: 3.00, cacheRead: 0.060, cacheWrite: 0.75, cacheWrite1h: 0.75 },
  'deepseek-v3.2': { input: 3.50, output: 17.50, cacheRead: 0.35, cacheWrite: 4.375, cacheWrite1h: 4.375 },
  'DeepSeek-V4-Flash-0731': { input: 0.55, output: 2.75, cacheRead: 0.055, cacheWrite: 0.6875, cacheWrite1h: 0.6875 },

  // Grok Models
  'grok-4.20-0309-reasoning': { input: 6.00, output: 30.00, cacheRead: 0.60, cacheWrite: 7.50, cacheWrite1h: 7.50 },
  'grok-4.20-0309-non-reasoning': { input: 4.00, output: 20.00, cacheRead: 0.40, cacheWrite: 5.00, cacheWrite1h: 5.00 },
  'grok-4.20-multi-agent-0309': { input: 5.00, output: 25.00, cacheRead: 0.50, cacheWrite: 6.25, cacheWrite1h: 6.25 },
  'grok-4.6': { input: 4.60, output: 23.00, cacheRead: 0.46, cacheWrite: 5.75, cacheWrite1h: 5.75 },
  'grok-4.5': { input: 4.50, output: 22.50, cacheRead: 0.45, cacheWrite: 5.625, cacheWrite1h: 5.625 },
  'grok-4.3': { input: 4.30, output: 21.50, cacheRead: 0.43, cacheWrite: 5.375, cacheWrite1h: 5.375 },
  'grok-build-0.1': { input: 3.00, output: 15.00, cacheRead: 0.30, cacheWrite: 3.75, cacheWrite1h: 3.75 },
  'grok-imagine-image-pro': { input: 3.50, output: 17.50, cacheRead: 0.35, cacheWrite: 4.375, cacheWrite1h: 4.375 },
  'grok-imagine-image': { input: 2.50, output: 12.50, cacheRead: 0.25, cacheWrite: 3.125, cacheWrite1h: 3.125 },
  'grok-imagine-image-edit': { input: 2.75, output: 13.75, cacheRead: 0.275, cacheWrite: 3.4375, cacheWrite1h: 3.4375 },
  'grok-imagine-image-lite': { input: 1.50, output: 7.50, cacheRead: 0.15, cacheWrite: 1.875, cacheWrite1h: 1.875 },

  // GLM Models
  'glm-5.3': { input: 3.00, output: 15.00, cacheRead: 0.30, cacheWrite: 3.75, cacheWrite1h: 3.75 },
  'glm-5.3-flashx': { input: 0.70, output: 3.50, cacheRead: 0.070, cacheWrite: 0.875, cacheWrite1h: 0.875 },
  'glm-5.3-flash': { input: 0.60, output: 3.00, cacheRead: 0.060, cacheWrite: 0.75, cacheWrite1h: 0.75 },
  'glm-5.2': { input: 2.75, output: 13.75, cacheRead: 0.275, cacheWrite: 3.4375, cacheWrite1h: 3.4375 },
  'glm-5.1': { input: 2.50, output: 12.50, cacheRead: 0.25, cacheWrite: 3.125, cacheWrite1h: 3.125 },

  // Kimi Models
  'kimi-k3': { input: 3.50, output: 17.50, cacheRead: 0.35, cacheWrite: 4.375, cacheWrite1h: 4.375 },
  'kimi-k2.7-code': { input: 2.70, output: 13.50, cacheRead: 0.27, cacheWrite: 3.375, cacheWrite1h: 3.375 },
  'kimi-k2.6': { input: 2.60, output: 13.00, cacheRead: 0.26, cacheWrite: 3.25, cacheWrite1h: 3.25 },
  'kimi-k2.5': { input: 2.50, output: 12.50, cacheRead: 0.25, cacheWrite: 3.125, cacheWrite1h: 3.125 },

  // Qwen Models
  'qwen3.8-max-preview': { input: 4.50, output: 22.50, cacheRead: 0.45, cacheWrite: 5.625, cacheWrite1h: 5.625 },
  'qwen3.8-max': { input: 4.00, output: 20.00, cacheRead: 0.40, cacheWrite: 5.00, cacheWrite1h: 5.00 },
  'qwen3.8-flash': { input: 0.75, output: 3.75, cacheRead: 0.075, cacheWrite: 0.9375, cacheWrite1h: 0.9375 },
  'qwen3.8-omni-flash': { input: 0.80, output: 4.00, cacheRead: 0.080, cacheWrite: 1.00, cacheWrite1h: 1.00 },
  'qwen3.7-max': { input: 3.70, output: 18.50, cacheRead: 0.37, cacheWrite: 4.625, cacheWrite1h: 4.625 },
  'qwen3.7-plus': { input: 3.20, output: 16.00, cacheRead: 0.32, cacheWrite: 4.00, cacheWrite1h: 4.00 },
  'qwen3.6-27b': { input: 2.70, output: 13.50, cacheRead: 0.27, cacheWrite: 3.375, cacheWrite1h: 3.375 },

  // MiniMax Models
  'minimax-m3': { input: 3.50, output: 17.50, cacheRead: 0.35, cacheWrite: 4.375, cacheWrite1h: 4.375 },
  'minimax-m2.7': { input: 2.70, output: 13.50, cacheRead: 0.27, cacheWrite: 3.375, cacheWrite1h: 3.375 },
  'minimax-m2.5': { input: 2.50, output: 12.50, cacheRead: 0.25, cacheWrite: 3.125, cacheWrite1h: 3.125 },

  // Mimo Models
  'mimo-v2.5-pro': { input: 2.75, output: 13.75, cacheRead: 0.275, cacheWrite: 3.4375, cacheWrite1h: 3.4375 },
  'mimo-v2.5': { input: 2.50, output: 12.50, cacheRead: 0.25, cacheWrite: 3.125, cacheWrite1h: 3.125 },

  // Nano Models
  'nano-banana-pro': { input: 1.50, output: 7.50, cacheRead: 0.15, cacheWrite: 1.875, cacheWrite1h: 1.875 },
  'nano-banana-2': { input: 0.80, output: 4.00, cacheRead: 0.08, cacheWrite: 1.00, cacheWrite1h: 1.00 },
  'nano-banana': { input: 0.50, output: 2.50, cacheRead: 0.05, cacheWrite: 0.625, cacheWrite1h: 0.625 },

  // HY Models
  'hy4-preview': { input: 3.00, output: 15.00, cacheRead: 0.30, cacheWrite: 3.75, cacheWrite1h: 3.75 },
  'hy3': { input: 2.50, output: 12.50, cacheRead: 0.25, cacheWrite: 3.125, cacheWrite1h: 3.125 },

  // Embedding Models
  'text-embedding-3-large': { input: 0.15, output: 0.15, cacheRead: 0.015, cacheWrite: 0.015, cacheWrite1h: 0.015 },
  'text-embedding-3-small': { input: 0.05, output: 0.05, cacheRead: 0.005, cacheWrite: 0.005, cacheWrite1h: 0.005 },
  'text-embedding-ada-002': { input: 0.10, output: 0.10, cacheRead: 0.010, cacheWrite: 0.010, cacheWrite1h: 0.010 },

  // Codex Model
  'codex-auto-review': { input: 2.00, output: 10.00, cacheRead: 0.20, cacheWrite: 2.50, cacheWrite1h: 2.50 },
};

const CONFIG = {
  a6Url: 'https://a6api.com/models',
  email: 'oskarcatalina@gmail.com',
  password: 'f3b8f297fb7e',
  tokenName: 'test',
  modelsToAnalyze: [
    'claude-sonnet-5',
    'claude-opus-5',
    'claude-fable-5',
    'claude-fable-5.1',
    'gpt-5.6-luna',
    'gpt-5.6-terra',
    'gpt-5.6-sol',
    'gpt-6-astra',
    'gemini-3.8-flash',
  ],
};

function calculatePrice(official, cheapest, mostExpensive) {
  const minMargin = mostExpensive / 0.15;  // 85% margen sobre peor caso (OBLIGATORIO)
  const maxPrice = official * 0.85;  // Máximo 85% del precio oficial (15% descuento mínimo)

  // Si el margen 85% ya supera el 85% del oficial → usa margen
  // (casos caros: Fable, Opus, Astra donde margen obligatorio > 85% oficial)
  if (minMargin >= maxPrice) {
    return minMargin;
  }

  // Si podemos subir sin pasar el 85% del oficial:
  // Balance entre margen sobre más barato Y techo de 85% oficial
  const competitiveMargin = cheapest / 0.15;

  // 10% competitivo + 90% hacia techo = prioriza subir precio cerca del oficial
  // Ejemplo: Sonnet oficial $2, más barato $0.018, más caro $0.0238
  // competitiveMargin = $0.018/0.15 = $0.12
  // maxPrice = $2 * 0.85 = $1.70
  // resultado = $0.12*0.1 + $1.70*0.9 = $1.542 (85% del oficial, no regalado)
  return competitiveMargin * 0.1 + maxPrice * 0.9;
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function doLogin(page) {
  console.log('🔐 Login...');
  await page.waitForSelector('input[name="username"]', { timeout: 5000 });
  await page.type('input[name="username"]', CONFIG.email, { delay: 50 });
  await wait(500);
  await page.type('input[name="password"]', CONFIG.password, { delay: 50 });
  await wait(500);

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const submitBtn = buttons.find(btn => btn.textContent.includes('继续') || btn.type === 'submit');
    if (submitBtn) submitBtn.click();
  });

  await wait(3000);
  console.log('✅ Login');
}

async function processModel(page, modelId) {
  const official = OFFICIAL_PRICES[modelId];

  if (!official) {
    console.log(`❌ No hay precios oficiales`);
    return;
  }

  // Buscar modelo
  console.log('🔍 Buscando...');

  try {
    // Esperar y hacer click en el input
    await page.waitForSelector('.semi-input', { timeout: 5000 });
    await page.click('.semi-input');
    await wait(800);

    // Seleccionar todo y borrar con backspace
    await page.evaluate(() => {
      const input = document.querySelector('.semi-input input');
      if (input) {
        input.focus();
        input.select();
      }
    });

    await wait(200);
    await page.keyboard.press('Backspace');
    await wait(300);

    await page.keyboard.type(modelId, { delay: 120 });
    await wait(3000);

    await page.waitForSelector('[role="option"]', { timeout: 8000 });

    const optionFound = await page.evaluate(() => {
      const options = document.querySelectorAll('[role="option"]');
      if (options.length > 0) {
        options[0].click();
        return true;
      }
      return false;
    });

    if (!optionFound) {
      throw new Error('No options found');
    }

    console.log('✅ Modelo');
    await wait(2000);
  } catch (e) {
    console.log(`❌ No encontrado: ${e.message}`);
    return;
  }

  // Sort
  console.log('🔽 Sort...');

  const sortFound = await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('.semi-select'));
    for (const select of selects) {
      const text = select.querySelector('.semi-select-selection-text');
      if (text && (text.textContent.includes('综合排序') || text.textContent.includes('输入价最低'))) {
        select.click();
        return text.textContent;
      }
    }
    return null;
  });

  console.log(`Sort selector: ${sortFound}`);

  await wait(1500);

  const optionClicked = await page.evaluate(() => {
    const options = Array.from(document.querySelectorAll('.semi-select-option-text'));
    const target = options.find(o => o.textContent.includes('输入价最低'));
    if (target) {
      target.click();
      return true;
    }
    return false;
  });

  console.log(`Sort option clicked: ${optionClicked}`);

  await wait(3000);
  console.log('✅ Sort');

  console.log('Esperando tabla...');
  await page.waitForSelector('details[data-market-row="true"]', { timeout: 10000 });
  await wait(3000);

  // Capturar
  console.log('📊 Capturando...');
  const providers = await page.evaluate(() => {
    const results = [];
    const items = Array.from(document.querySelectorAll('details[data-market-row="true"]'));

    for (let i = 0; i < items.length && results.length < 5; i++) {
      const item = items[i];

      try {
        const summary = item.querySelector('summary');
        if (!summary) continue;

        const modelText = summary.querySelector('.marketplace-model-copy strong')?.textContent || '';
        const idMatch = modelText.match(/商户ID\s*(\d+)/);
        if (!idMatch) continue;

        if (!item.open) item.open = true;

        const detail = item.querySelector('.expand-detail');
        if (!detail) continue;

        const merchantRow = detail.querySelector('.price-compare-row.merchant');
        if (!merchantRow) continue;

        const prices = Array.from(merchantRow.querySelectorAll('strong'));
        if (prices.length < 5) continue;

        const input = parseFloat(prices[0].textContent.replace('$', ''));
        const output = parseFloat(prices[1].textContent.replace('$', ''));
        const cacheRead = parseFloat(prices[2].textContent.replace('$', ''));
        const cacheWrite = parseFloat(prices[3].textContent.replace('$', ''));
        const cacheWrite1h = parseFloat(prices[4].textContent.replace('$', ''));

        const successText = summary.querySelector('.success-rate')?.textContent || '';
        const match7d = successText.match(/7d.*?([0-9.]+)%/);
        const success7d = match7d ? parseFloat(match7d[1]) : 0;

        const uptimeText = summary.querySelector('.uptime')?.textContent || '';
        const matchUptime = uptimeText.match(/([0-9.]+)%/);
        const uptime = matchUptime ? parseFloat(matchUptime[1]) : 0;

        results.push({
          merchantId: parseInt(idMatch[1]),
          input,
          output,
          cacheRead,
          cacheWrite,
          cacheWrite1h,
          success7d,
          uptime,
        });
      } catch (e) {}
    }

    return results;
  });

  if (providers.length === 0) {
    console.log('❌ No providers');
    return;
  }

  console.log(`\n✅ ${providers.length} capturados\n`);

  // Obtener activos actuales primero
  const currentActive = await page.evaluate(() => {
    const actives = [];
    const items = Array.from(document.querySelectorAll('details[data-market-row="true"]'));

    for (const item of items) {
      const summary = item.querySelector('summary');
      const btn = summary?.querySelector('button.marketplace-btn.route.is-active');

      if (btn) {
        const modelText = summary.querySelector('.marketplace-model-copy strong')?.textContent || '';
        const idMatch = modelText.match(/商户ID\s*(\d+)/);

        if (idMatch) {
          const priceCells = Array.from(summary.querySelectorAll('.price-cell strong'));
          const input = priceCells[0] ? parseFloat(priceCells[0].textContent.replace('$', '')) : 999;

          actives.push({
            merchantId: parseInt(idMatch[1]),
            input,
          });
        }
      }
    }

    return actives;
  });

  console.log(`📋 Actualmente ${currentActive.length} en pool`);

  // Combinar activos actuales + nuevos capturados
  const combined = [
    ...currentActive.map(a => ({
      merchantId: a.merchantId,
      input: a.input,
      source: 'active',
      // Buscar datos completos en providers si existe
      fullData: providers.find(p => p.merchantId === a.merchantId)
    })),
    ...providers.map(p => ({
      merchantId: p.merchantId,
      input: p.input,
      source: 'new',
      fullData: p
    })),
  ];

  // Eliminar duplicados (mantener la entrada más reciente)
  const unique = Object.values(
    combined.reduce((acc, item) => {
      if (!acc[item.merchantId] || item.source === 'new') {
        acc[item.merchantId] = item;
      }
      return acc;
    }, {})
  );

  // Ordenar por precio y tomar top 5 más baratos
  const top5 = unique.sort((a, b) => a.input - b.input).slice(0, 5);

  console.log(`\n🎯 Top 5 más baratos: ${top5.map(m => m.merchantId).join(', ')}`);

  // AHORA calcular precio basándose en el top5 REAL que quedará activo
  const cheapestInTop5 = top5[0];
  const mostExpensiveInTop5 = top5[4];

  // Necesitamos datos completos del más barato y más caro
  const cheapestData = cheapestInTop5.fullData || providers.find(p => p.merchantId === cheapestInTop5.merchantId) || {
    input: cheapestInTop5.input,
    output: cheapestInTop5.input * 5,
    cacheRead: cheapestInTop5.input * 0.1,
    cacheWrite: cheapestInTop5.input * 1.25,
    cacheWrite1h: cheapestInTop5.input * 2,
  };

  const mostExpensiveData = mostExpensiveInTop5.fullData || providers.find(p => p.merchantId === mostExpensiveInTop5.merchantId) || {
    input: mostExpensiveInTop5.input,
    output: mostExpensiveInTop5.input * 5,
    cacheRead: mostExpensiveInTop5.input * 0.1,
    cacheWrite: mostExpensiveInTop5.input * 1.25,
    cacheWrite1h: mostExpensiveInTop5.input * 2,
  };

  // Calcular precio de venta único para todos basándose en el TOP5 REAL
  const finalInput = calculatePrice(official.input, cheapestData.input, mostExpensiveData.input);
  const finalOutput = calculatePrice(official.output, cheapestData.output, mostExpensiveData.output);
  const finalCacheRead = calculatePrice(official.cacheRead, cheapestData.cacheRead, mostExpensiveData.cacheRead);
  const finalCacheWrite = calculatePrice(official.cacheWrite, cheapestData.cacheWrite, mostExpensiveData.cacheWrite);
  const finalCacheWrite1h = calculatePrice(official.cacheWrite1h, cheapestData.cacheWrite1h, mostExpensiveData.cacheWrite1h);

  // Validar que garantice 85% margen sobre el más caro del top5
  const inputMargin = finalInput >= mostExpensiveData.input / 0.15;
  const outputMargin = finalOutput >= mostExpensiveData.output / 0.15;
  const margin = ((finalInput - mostExpensiveData.input) / finalInput * 100);

  console.log(`\n💰 PRECIO ÚNICO (basado en top5 real):`);
  console.log(`   Más barato: ${cheapestInTop5.merchantId} ($${cheapestData.input})`);
  console.log(`   Más caro: ${mostExpensiveInTop5.merchantId} ($${mostExpensiveData.input})`);
  console.log(`   Input: $${finalInput.toFixed(4)} (margen: ${margin.toFixed(1)}%)`);
  console.log(`   Output: $${finalOutput.toFixed(4)}`);
  console.log(`   CacheRead: $${finalCacheRead.toFixed(4)}`);
  console.log(`   CacheWrite: $${finalCacheWrite.toFixed(4)}`);
  console.log(`   CacheWrite1h: $${finalCacheWrite1h.toFixed(4)}`);

  if (!inputMargin || !outputMargin) {
    console.log(`\n⚠️  NO GARANTIZA 85% MARGEN - Recalculando con margen puro...`);
    const safeInput = mostExpensiveData.input / 0.15;
    const safeOutput = mostExpensiveData.output / 0.15;
    const safeMargin = ((safeInput - mostExpensiveData.input) / safeInput * 100);

    console.log(`   Input seguro: $${safeInput.toFixed(4)} (margen: ${safeMargin.toFixed(1)}%)`);
    console.log(`   Output seguro: $${safeOutput.toFixed(4)}`);
  }

  const approved = top5.map(t => ({
    merchantId: t.merchantId,
    input: t.input,
    finalInput,
    finalOutput,
    finalCacheRead,
    finalCacheWrite,
    finalCacheWrite1h,
  }));

  console.log(`\n✅ ${approved.length} en top5 final\n`);

  // Identificar qué activar y desactivar
  const toActivate = top5.filter(m => !currentActive.some(a => a.merchantId === m.merchantId));
  const toDeactivate = currentActive.filter(a => !top5.some(t => t.merchantId === a.merchantId));

  console.log(`🎯 Top 5 más baratos: ${top5.map(m => m.merchantId).join(', ')}`);

  if (toDeactivate.length > 0) {
    console.log(`❌ Desactivar (caros): ${toDeactivate.map(m => m.merchantId).join(', ')}`);
  }

  if (toActivate.length > 0) {
    console.log(`✅ Activar (baratos): ${toActivate.map(m => m.merchantId).join(', ')}`);
  }

  // Asegurar que siempre haya exactamente 5 activos
  const finalActiveCount = currentActive.length - toDeactivate.length + toActivate.length;
  if (finalActiveCount < 5) {
    console.log(`⚠️  Solo quedarían ${finalActiveCount} activos, necesitamos 5`);
  }

  // Desactivar los que sobran
  console.log('\n🔄 Ajustando pool...');
  for (const m of toDeactivate) {
    try {
      await page.evaluate((merchantId) => {
        const items = Array.from(document.querySelectorAll('details[data-market-row="true"]'));
        for (const item of items) {
          const summary = item.querySelector('summary');
          const modelText = summary?.querySelector('.marketplace-model-copy strong')?.textContent || '';
          const idMatch = modelText.match(/商户ID\s*(\d+)/);

          if (idMatch && parseInt(idMatch[1]) === merchantId) {
            const btn = summary.querySelector('button.marketplace-btn.route.is-active');
            if (btn) {
              btn.click();
              return true;
            }
          }
        }
        return false;
      }, m.merchantId);

      await wait(500);
      console.log(`❌ ${m.merchantId} desactivado`);
    } catch (e) {
      console.log(`⚠️  ${m.merchantId} fallo al desactivar`);
    }
  }

  // Activar los nuevos
  for (const m of toActivate) {
    try {
      const result = await page.evaluate((merchantId) => {
        const items = Array.from(document.querySelectorAll('details[data-market-row="true"]'));
        for (const item of items) {
          const summary = item.querySelector('summary');
          const modelText = summary?.querySelector('.marketplace-model-copy strong')?.textContent || '';
          const idMatch = modelText.match(/商户ID\s*(\d+)/);

          if (idMatch && parseInt(idMatch[1]) === merchantId) {
            const btn = summary.querySelector('button.marketplace-btn.route');

            if (btn && btn.classList.contains('is-active')) {
              return 'already';
            }

            if (btn) {
              btn.click();
              return 'added';
            }
          }
        }
        return 'not_found';
      }, m.merchantId);

      if (result === 'already') {
        console.log(`⏭️  ${m.merchantId} ya activo`);
        continue;
      }

      await wait(800);

      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const closeBtn = buttons.find(btn => btn.textContent.includes('关闭'));
        if (closeBtn) closeBtn.click();
      });

      console.log(`✅ ${m.merchantId} activado`);
      await wait(500);
    } catch (e) {
      console.log(`❌ ${m.merchantId} falló: ${e.message}`);
    }
  }

  // Mostrar el peor caso (más caro) con margen garantizado
  const worst = top5[top5.length - 1];  // El más caro de los top 5
  const worstData = approved.find(a => a.merchantId === worst.merchantId);

  if (worstData) {
    const margin = ((worstData.finalInput - worstData.input) / worstData.finalInput * 100);
    console.log(`\n💰 PEOR CASO (garantiza 85% mínimo):`);
    console.log(`   Más caro del top5: ${worst.merchantId} ($${worstData.input})`);
    console.log(`   Precio de venta único:`);
    console.log(`     Input: $${worstData.finalInput.toFixed(4)} (margen: ${margin.toFixed(1)}%)`);
    console.log(`     Output: $${worstData.finalOutput.toFixed(4)}`);
    console.log(`     CacheRead: $${worstData.finalCacheRead.toFixed(4)}`);
    console.log(`     CacheWrite: $${worstData.finalCacheWrite.toFixed(4)}`);
    console.log(`     CacheWrite1h: $${worstData.finalCacheWrite1h.toFixed(4)}`);
    console.log(`\n   ✅ Si responde el más caro ($${worstData.input}), ganas ${margin.toFixed(1)}%`);
  }
}

async function main() {
  console.log('🚀 A6 Multi-Model Scraper\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
  });

  const page = await browser.newPage();

  console.log('🌐 Login...');
  await page.goto('https://a6api.com/login', { waitUntil: 'networkidle2' });

  try {
    await doLogin(page);
  } catch (e) {
    console.log('❌ Login falló');
    process.exit(1);
  }

  await page.goto(CONFIG.a6Url, { waitUntil: 'networkidle2' });
  await wait(2000);

  // Token
  console.log('\n📌 Token...');
  await page.click('.semi-select.glass-search-select');
  await wait(1000);
  await page.evaluate((name) => {
    const options = Array.from(document.querySelectorAll('.semi-select-option-text'));
    const option = options.find(o => o.textContent.includes(name));
    if (option) option.click();
  }, CONFIG.tokenName);
  await wait(1000);
  console.log('✅ Token');

  // PROCESAR TODOS
  for (let i = 0; i < CONFIG.modelsToAnalyze.length; i++) {
    const modelId = CONFIG.modelsToAnalyze[i];

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 ${modelId} (${i + 1}/${CONFIG.modelsToAnalyze.length})`);
    console.log('='.repeat(60));

    // F5 para limpiar estado (excepto primer modelo)
    if (i > 0) {
      console.log('🔄 Refresh...');
      await page.reload({ waitUntil: 'networkidle2' });
      await wait(2000);

      // Re-seleccionar token después de F5
      console.log('📌 Token...');
      await page.click('.semi-select.glass-search-select');
      await wait(1000);
      await page.evaluate((name) => {
        const options = Array.from(document.querySelectorAll('.semi-select-option-text'));
        const option = options.find(o => o.textContent.includes(name));
        if (option) option.click();
      }, CONFIG.tokenName);
      await wait(1000);
      console.log('✅ Token');
    }

    await processModel(page, modelId);

    await wait(2000);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ COMPLETADO');
  console.log('='.repeat(60));
  console.log('\nENTER para cerrar...');
  await new Promise(resolve => process.stdin.once('data', resolve));
  await browser.close();
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
