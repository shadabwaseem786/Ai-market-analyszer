# Ai-market-analyszer — Recovery V3

## Recovery baseline
- V1253-era project retained as the primary logic baseline.
- V870 cross-asset/intermarket modules retained where they add non-conflicting capability.
- Existing Vercel V1253 production deployment is intentionally untouched.

## Vercel API compatibility
The project contains API adapters for:
- `/api/market-data`
- `/api/catalyst-feed`
- `/api/ai-engine`
- `/api/fo-scan`
- `/api/omniscience`

The frontend catalyst feed now requests `/api/catalyst-feed` instead of the static
`data/catalyst-feed.json` file. This allows a Vercel deployment to use the server-side
feed implementation while retaining the existing data schema.

## Safety
This archive is a recovery candidate. Do not replace the known-good V1253 production
deployment until the new deployment is build-validated and the live API responses are
verified.
