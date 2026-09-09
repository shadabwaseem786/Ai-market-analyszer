// AI Market Analyzer — V1253/V870 recovery adapter.
// Uses the existing validated serverless modules; no order execution.
const market = require('../netlify/functions/market-data');
const catalyst = require('../netlify/functions/catalyst-feed');
const ai = require('../netlify/functions/ai-engine');
const omniscience = require('../netlify/functions/omniscience');
function normalize(result) {
  if (!result) return { statusCode: 500, body: JSON.stringify({ error: 'Empty backend result' }) };
  return result;
}
exports.default = async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') return res.status(204).end();
    const q = req.query || {};
    if (q.action === 'ai') {
      const body = req.body || {};
      const r = normalize(await ai.handler({ body: JSON.stringify(body) }));
      return res.status(r.statusCode || 200).setHeader('content-type','application/json').send(r.body);
    }
    if (q.action === 'omniscience') {
      const body = req.body || {};
      const r = normalize(await omniscience.handler({ body: JSON.stringify(body) }));
      return res.status(r.statusCode || 200).setHeader('content-type','application/json').send(r.body);
    }
    const [m, c] = await Promise.all([market.handler({}), catalyst.handler({})]);
    const out = {
      version: 'MASTER-V1253-V870',
      generatedAt: new Date().toISOString(),
      market: JSON.parse(m.body || '{}'),
      catalyst: JSON.parse(c.body || '{}'),
      guardrails: ['public-data-only','no-execution','freshness-gates','bounded-fallbacks']
    };
    return res.status(200).setHeader('content-type','application/json').setHeader('cache-control','no-store').send(JSON.stringify(out));
  } catch (e) {
    return res.status(500).setHeader('content-type','application/json').send(JSON.stringify({version:'MASTER-V1253-V870',action:'NO-TRADE',error:e.message}));
  }
};
module.exports = exports.default;
