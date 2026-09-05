# V18000 Historical Dataset Sources

## Primary open-source pipeline
Indian-market-data-pipeline (MIT): 1-minute NIFTY, BANKNIFTY, FINNIFTY and India VIX; NIFTY/BANKNIFTY futures; NIFTY weekly options with volume and open interest. Data is timezone-aware Asia/Kolkata Parquet.

Official repository: https://github.com/JATINDHURVE/Indian-market-data-pipeline

## Options research source
kite-history (MIT): tooling for building 1-minute NIFTY, BANKNIFTY and FINNIFTY weekly/monthly options databases.

Official repository: https://github.com/ashwanthkumar/kite-history

## Independent BankNifty cross-check
BankNifty-Data provides 1-minute through daily BankNifty history.

Official repository: https://github.com/sandeepkapri/BankNifty-Data

## Validation library
purged-cross-validation (MIT) provides walk-forward, purging, embargo, CPCV, PSR, DSR and minimum track-record calculations.

Official repository: https://github.com/eslazarev/purged-cross-validation

## Data policy
Sources are inputs, not truth. Every imported file must pass timestamp, duplicate, gap, timezone, contract-expiry and corporate/calendar consistency checks before training.
