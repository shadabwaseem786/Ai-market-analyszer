# V680000 — Advanced Backtesting, Walk-Forward & Monte Carlo Validation 4.0

Adds cost-aware backtesting, walk-forward splits, purge/embargo helpers, Monte Carlo resampling,
robustness scoring and overfit guards.

Monte Carlo here is a trade-sequence resampling baseline. Production validation should use
point-in-time datasets, realistic contract rolls, expiry handling, survivorship-bias controls,
corporate actions, exchange-specific costs and timestamp-correct execution assumptions.
