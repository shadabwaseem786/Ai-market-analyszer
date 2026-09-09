// AI Market Analyzer — robust V1254 realtime adapter.
// Uses the proven F&O scanner as the primary market source and the existing
// catalyst feed. No synthetic prices, no order execution, no broker dependency.

const foScan = require('../netlify/functions/fo-scan');
const catalyst = require('../netlify/functions/catalyst-feed');

function jsonBody(r) {
  try { return JSON.parse(r?.body || '{}'); } catch (_) { return {}; }
}

function normalizeMarket(x) {
  const probability = Number(x?.probability);
  const confidence = Number.isFinite(probability)
    ? Math.round(50 + Math.abs(probability - 50) * 0.9)
    : null;
  const agreementPct = Number(x?.agreement);
  const riskScore = Number(x?.risk);
  const score = Number.isFinite(probability)
    ? Math.round(probability)
    : null;

  return {
    ...x,
    symbol: x?.symbol || null,
    price: Number.isFinite(Number(x?.price)) ? Number(x.price) : null,
    score,
    confidence,
    bias: x?.direction || 'NEUTRAL',
    trend: Number(x?.trend) > 0 ? 'BULL' : Number(x?.trend) < 0 ? 'BEAR' : 'MIXED',
    agreementPct: Number.isFinite(agreementPct) ? agreementPct : null,
    riskScore: Number.isFinite(riskScore) ? riskScore : null,
    dataHealth: Number(x?.dataHealth) || 0,
    quality: Number(x?.quality) || 0,
    ageMinutes: Number.isFinite(Number(x?.ageMinutes)) ? Number(x.ageMinutes) : null,
    freshnessTier: Number(x?.ageMinutes) <= 15 ? 'FRESH' :
      Number(x?.ageMinutes) <= 60 ? 'AGING' : 'STALE',
    rationale: x?.rationale || 'F&O multi-factor scanner',
    action: x?.action || 'WAIT'
  };
}

async function invoke(fn) {
  const r = await fn({});
  return jsonBody(r);
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') return res.status(204).end();

    // Preserve the existing AI/omniscience action routes.
    const q = req.query || {};
    if (q.action === 'ai') {
      const ai = require('../netlify/functions/ai-engine');
      const body = req.body || {};
      const r = await ai.handler({ body: JSON.stringify(body) });
      const payload = jsonBody(r);
      return res.status(Number(r?.statusCode) || 200)
        .setHeader('content-type', 'application/json')
        .setHeader('cache-control', 'no-store')
        .send(payload);
    }

    if (q.action === 'omniscience') {
      const omniscience = require('../netlify/functions/omniscience');
      const body = req.body || {};
      const r = await omniscience.handler({ body: JSON.stringify(body) });
      const payload = jsonBody(r);
      return res.status(Number(r?.statusCode) || 200)
        .setHeader('content-type', 'application/json')
        .setHeader('cache-control', 'no-store')
        .send(payload);
    }

    // Primary realtime path: F&O scanner + catalyst feed.
    const [marketRaw, catalystRaw] = await Promise.all([
      invoke(foScan),
      invoke(catalyst)
    ]);

    const rawData = marketRaw?.data || {};
    const data = {};
    for (const [key, value] of Object.entries(rawData)) {
      data[key] = normalizeMarket(value);
    }

    const validCount = Object.values(data).filter(x => x.quality === 100).length;
    const total = Object.keys(data).length;
    const c = catalystRaw?.summary || {};

    const out = {
      status: validCount > 0 ? 'INTEGRATED' : 'DEGRADED',
      gate: validCount > 0 ? 'READY' : 'HOLD',
      version: 'V1254-FO-REALTIME',
      generatedAt: marketRaw?.generatedAt || new Date().toISOString(),
      market: {
        validCount,
        total,
        session: 'PUBLIC-DATA',
        errors: marketRaw?.errors || [],
        data
      },
      catalyst: catalystRaw || {
        items: [],
        summary: {
          count: 0,
          catalystBias: 'NEUTRAL',
          weightedBias: 'NEUTRAL',
          catalystConfidence: 0,
          catalystRisk: 100,
          catalystHealth: 0,
          catalystFreshness: 0
        }
      },
      data: {
        ...data
      },
      guardrails: [
        'public-data-only',
        'no-execution',
        'freshness-gates',
        'abstention-first',
        'no-synthetic-prices',
        'fno-scanner-primary'
      ]
    };

    return res.status(200)
      .setHeader('content-type', 'application/json')
      .setHeader('cache-control', 'no-store')
      .setHeader('access-control-allow-origin', '*')
      .send(out);
  } catch (e) {
    return res.status(500)
      .setHeader('content-type', 'application/json')
      .setHeader('cache-control', 'no-store')
      .send({
        version: 'V1254-FO-REALTIME',
        status: 'DEGRADED',
        gate: 'HOLD',
        error: String(e?.message || e),
        data: {},
        market: { validCount: 0, total: 0, errors: [String(e?.message || e)] },
        catalyst: { items: [], summary: { count: 0 } }
      });
  }
};
