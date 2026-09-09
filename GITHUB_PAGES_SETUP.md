# V730000 — GitHub Pages Setup

Repository: `shadabwaseem786/Ai-market-analyszer`

## Structure requirement

The deploy workflow publishes the repository contents as the GitHub Pages site. `index.html` must be present at the repository root.

Required runtime/data directories are retained:

- `.github/workflows/`
- `data/`
- `ml/`
- `netlify/functions/`
- `scripts/`
- `tests/`

## Enable GitHub Pages

1. Open **Settings → Pages** in the repository.
2. Under **Build and deployment**, choose **GitHub Actions**.
3. Push/commit to `main`, or manually run **Deploy V730000 to GitHub Pages** from Actions.
4. Open the Pages URL shown by GitHub after the deployment completes.

## Data model

GitHub Pages is static hosting. The dashboard reads the versioned JSON snapshots in `data/`. The `Refresh V730000 market data` workflow regenerates those snapshots periodically using the repository's validated public-feed functions.

The application remains paper-only and uses conservative `HOLD / WAIT / NO-TRADE` behavior when data is invalid, stale, incomplete, or unavailable.

## Runtime separation

GitHub Pages serves the static dashboard and versioned data snapshots. The Netlify function `/.netlify/functions/v730-runtime` is the integrated server-side decision-support runtime. Pages deployment does not imply that the Netlify runtime is production-deployed.

V730000 is not considered verified until the repository's executable CI gates, runtime smoke test, browser smoke test, retention/package checks, and deployment identity checks all have evidence.