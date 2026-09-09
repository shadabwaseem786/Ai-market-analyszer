# V730000 Release Manifest

Generated as a release-control manifest for the frozen recovery branch.

## Retention invariant

The release ZIP MUST be created from `git archive HEAD` (or an equivalent complete-tree export). A manually curated ZIP is not acceptable.

## Historical upgrade retention

All tracked historical artifacts are release inputs. This includes every tracked file under:
- `ml/`
- `netlify/functions/`
- `tests/`
- frontend assets
- configuration
- audit and recovery documentation

A future feature upgrade must first preserve the preceding V730000 tree in the package, then add its new files. No prior version directory/file may be removed solely because a newer version supersedes it.

## Release identity

Release label: V730000
Branch: baseline/V730000-FINAL-CANDIDATE
Certification: NOT YET VERIFIED

## Immutable candidate baseline

Baseline branch: `baseline/V730000-FINAL-CANDIDATE`

This branch is the retention anchor for the current V730000 candidate. Any future feature-number upgrade must preserve the complete tree represented by this baseline before adding new work. A future package that cannot demonstrate preservation of this baseline is rejected.

## Mandatory gates

1. Repository syntax checks pass.
2. AI contract tests pass.
3. Complete-tree ZIP retention check passes.
4. Netlify deployment contains the same commit as the audited branch.
5. `/.netlify/functions/v730-runtime` executes successfully.
6. Newbie and Expert modes both consume the same runtime result.
7. Market-selection filtering remains synchronized in both modes.
8. Browser smoke test passes.
9. Final ZIP checksum is generated.
10. Final package is independently inspected before certification.

## Prohibited

Do not label this package production-verified until all ten gates have evidence.


## Pinned retention baseline

The historical-retention CI gate is pinned to immutable audited baseline commit `735f8407d75b5e66977613573cf2ce071b69a8e4`. The package workflow also runs from the audited baseline branch, so the release artifact is generated from the retention anchor rather than a stale development branch. This prevents a moving branch reference from silently changing the retention baseline.

## Supersession / deprecation rule

Historical code is retained by default. An older implementation may be removed from the active runtime or from a future release package only when a replacement is demonstrably more efficient or superior.

A replacement must document:
- predecessor path/module and exact capability being replaced;
- replacement path/module;
- objective reason for replacement (performance, correctness, reliability, maintainability, security, resource use, or equivalent);
- evidence from regression/contract tests;
- confirmation that no required capability or UI behavior is lost;
- migration/compatibility notes where applicable.

Until these conditions are recorded and the replacement passes the applicable tests, the predecessor remains retained in the source tree and release ZIP.

### Default decision

**Preserve > deprecate > remove.**

Removal is exceptional and must be justified by evidence, not merely by the existence of a newer version number.


## Legacy adapter audit

The frontend intentionally retains `ml/v100000-dashboard.js` and `ml/godmode-ai.js`. These are legacy research/UI layers and are not discarded merely because V730000 exists. They remain subject to regression review because they are loaded by the page.

The V730000 controller is the authoritative Newbie/Expert presentation layer. Legacy layers must not override V730000 mode state or decision fields. If a future replacement makes a legacy layer redundant, its removal requires the evidence-based supersession procedure above.


## Non-destructive upgrade policy

Before any future feature-number upgrade:
1. Record the current audited baseline commit.
2. Generate a baseline file inventory and checksum manifest.
3. Add the new implementation without deleting predecessor artifacts.
4. Run predecessor-vs-replacement capability/regression checks.
5. Only an evidence-backed supersession may mark predecessor code deprecated.
6. The final ZIP must include the retained baseline inventory plus all new files.
7. A package missing any baseline file fails release certification unless an approved supersession record identifies the exact predecessor, replacement, evidence, and retained capability.

This policy applies to code, UI assets, tests, configuration, audit records, and other tracked release artifacts—not only ML modules.


## Final-candidate snapshot

This branch is the V730000 final-candidate retention snapshot created after the current audit batch. Future feature work must branch from this snapshot or explicitly prove preservation of its complete tree. Certification remains pending until executable CI and Netlify/browser verification produce evidence.

## Verification evidence checkpoint — 2026-09-05

GitHub Actions evidence is currently not attached to the final-candidate snapshot commit. The repository integration can therefore be source-audited, but V730000 must remain **UNCERTIFIED** until the retention/package workflows execute successfully on this candidate. No claim of successful CI execution is made from source inspection alone.


## Audit checkpoint — retention gate trigger

A controlled no-code audit checkpoint was committed to trigger the final-candidate retention/package workflow. No application feature or historical implementation is removed by this checkpoint.