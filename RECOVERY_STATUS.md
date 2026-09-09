# Ai-market-analyszer Master Recovery

Baseline: latest available `Ai-market-analyszer-main (2).zip` (V1253-era code, including `v125300-calibration.js`).
Supplement: V870000 cross-asset/intermarket archive, added only where files did not conflict with the newer baseline.

## Deployment compatibility
- Added Vercel API adapters under `api/` for market-data, catalyst-feed, ai-engine, fo-scan and omniscience.
- Updated frontend calls from Netlify function paths to `/api/*` so the same repository can run on Vercel.
- Preserved original Netlify function implementations as the underlying server logic.
- No broker/order-execution dependency introduced.

## Precedence
When a path existed in the V1253-era baseline, that file was retained rather than overwritten by the older V870 archive. V870-only modules were added.
