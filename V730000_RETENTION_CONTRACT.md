# V730000 Retention Contract

This is a release-control contract, not a feature upgrade.

## Non-negotiable rule

Every package produced from the frozen V730000 recovery tree must be generated from the complete Git tree and must contain every tracked file. Historical upgrade modules must not be selectively copied, flattened, renamed, or omitted.

## Required package contents

- Entire tracked repository tree
- All historical ML/upgrade artifacts
- Current frontend
- Netlify functions
- Tests
- Audit/recovery records
- Configuration files

## Verification

The GitHub Actions workflow named V730000 Retention + Package Gate uses git archive to package the exact repository tree and compares the ZIP contents against git ls-files. The workflow fails if even one tracked file is absent.

The resulting ZIP receives a SHA-256 checksum and is uploaded as a workflow artifact.

## Freeze

No feature-number increment is authorized by this contract. V730000 remains the release target until audit, integration, testing, Netlify verification, and packaging gates all pass.


## Evidence-based supersession

Legacy upgrade artifacts are retained unless a newer implementation is proven more efficient or otherwise materially superior. A version number alone never authorizes deletion.

For any proposed removal, record predecessor, replacement, reason, test evidence, capability-parity result, and migration notes. If evidence is absent or ambiguous, retain the predecessor.
