# V730000 Recovery Audit — Checkpoint

**Status:** FROZEN / RECOVERY
**Branch:** `upgrade/v611000-v620000`
**Release target:** V730000 only

## Verified at this checkpoint

- `index.html` has exactly one HTML/head/body/main structural pair.
- Newbie and Expert controls exist in the live dashboard document.
- V730 UI controller is present and initializes a persistent mode.
- V730 browser client calls `/.netlify/functions/v730-runtime`.
- Shared market-filter integration targets the live decision board.
- `v730-runtime.js` exists and calls the repository's real market-data, catalyst-feed and AI-engine functions.
- `ai-engine.js` exposes its existing inference function to the integrated runtime.
- Runtime has a no-valid-market-feed safety gate that returns DEGRADED/HOLD.
- Runtime defaults incomplete catalyst summary fields to conservative values.
- Netlify configuration publishes the repository root and uses `netlify/functions`.

## Not yet verified

- Live Netlify execution of the new V730 runtime endpoint.
- Real browser smoke test against deployed site.
- End-to-end response validation with live Yahoo/RSS feeds.
- Regression comparison against the previous production dashboard.
- Full dependency/import audit of every historical upgrade module.
- Complete implementation of the V630000–V730000 placeholder orchestration modules.
- Final ZIP/package integrity.

## Known historical discrepancy

The repository contains V630000–V730000 core files, including the V640000 probabilistic-explainable core. These modules are very small orchestration skeletons using handler injection. Their presence is therefore recorded as **architecture defined**, not as proof that the corresponding advanced capability is implemented and executing.

## New verification evidence

- Git comparison shows this recovery branch is 139 commits ahead of `main` and 0 commits behind at the audit checkpoint.
- The branch contains the complete V630000–V730000 module sequence; earlier notes incorrectly stated that V640000 was missing. That statement is superseded by this checkpoint.
- Netlify production is still serving the `main` commit `c8af850f94849de4b90a67e6b5716607b7a504ec` and currently reports 3 deployed functions (`ai-engine`, `catalyst-feed`, `market-data`). The V730000 runtime is therefore not production-deployed yet.
- A Netlify deploy-preview status is present as a successful check on an audited branch commit, but the available evidence does not yet prove that the latest V730000 runtime is the deployed preview artifact.

## Release rule

V730000 must not be labelled **Verified** until all outstanding checks pass. No V731000+ feature-number work is permitted before that point.


## Retention guard added

A dedicated CI workflow now blocks deletion of tracked historical artifacts under `ml/`, `netlify/functions/`, and `tests/` when compared with the repository's `main` baseline. This is separate from the ZIP completeness check: it protects the source tree itself from silently losing earlier upgrade work.


## Automated retention rule status

The V730000 recovery branch now has both a source-tree historical deletion guard and a complete-tree ZIP retention gate. These controls are release prerequisites for any future feature-number upgrade.

## Runtime contract hardening

The integrated V730000 runtime now passes the Netlify event through to both underlying feed handlers. The feed handlers explicitly accept the event contract, preventing interface drift between the orchestrator and its child functions.