// AI Market Analyzer — V1253/V870 unified realtime API adapter.
const market = require('../netlify/functions/market-data');
const catalyst = require('../netlify/functions/catalyst-feed');
const ai = require('../netlify/functions/ai-engine');
const omniscience = require('../netlify/functions/omniscience');

function send(res, result) {
  const r = result || { statusCode: 500, body: JSON.stringify({ error: 'Empty backend result' }) };
  return res.status(r.statusCode || 200)
    .setHeader('content-type', 'application/json')
    .setHeader('cache-control', 'no-store')
    .send(r.body || '{}');
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') return res.status(204).end();

    const q = req.query || {};
    const body = req.body || {};

    if (q.action === 'ai') {
      return send(res, await ai.handler({ body: JSON.stringify(body) }));
    }

    if (q.action === 'omniscience') {
      return send(res, await omniscience.handler({ body: JSON.stringify(body) }));
    }

    const [m, c] = await Promise.all([
      market.handler({}),
      catalyst.handler({})
    ]);

    return send(res, {
      statusCode: 200,
      body: JSON.stringify({
        version: 'MASTER-V1253-V870',
        generatedAt: new Date().toISOString(),
        market: JSON.parse(m.body || '{}'),
        catalyst: JSON.parse(c.body || '{}'),
        guardrails: [
          'public-data-only',
          'no-execution',
          'freshness-gates',
          'bounded-fallbacks'
        ]
      })
    });
  } catch (e) {
    return send(res, {
      statusCode: 500,
      body: JSON.stringify({
        version: 'MASTER-V1253-V870',
        action: 'NO-TRADE',
        error: e.message
      })
    });
  }
};
