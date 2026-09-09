// AI Market Analyzer V1254 — GitHub/Vercel synchronization health endpoint.
// Read-only diagnostic; no market/order side effects.
module.exports = function handler(req, res) {
  const payload = {
    ok: true,
    service: 'ai-market-analyzer',
    version: 'V1254',
    deployment: process.env.VERCEL_DEPLOYMENT_ID || null,
    deploymentUrl: process.env.VERCEL_URL || null,
    gitRef: process.env.VERCEL_GIT_COMMIT_REF || null,
    gitCommit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    environment: process.env.VERCEL_ENV || null,
    generatedAt: new Date().toISOString()
  };
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'no-store');
  return res.status(200).send(JSON.stringify(payload));
};
