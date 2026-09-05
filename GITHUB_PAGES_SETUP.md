# V730000 — GitHub Pages Setup

Repository: `shadabwaseem786/My-test-1`

## Structure requirement

Upload the **contents** of this package to the repository root. `index.html` must be directly under the repository root.

Required runtime directories are retained:

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

GitHub Pages is static hosting. The dashboard reads the versioned JSON snapshots in `data/`. The `Refresh GitHub Pages Data` workflow can regenerate those snapshots periodically using the repository's validated public-feed functions.

The application remains paper-only and uses conservative NO-TRADE behavior when data is invalid, stale, or unavailable.
