# V720000 — Market Regime & Adaptive Strategy Router

Adds regime classification and adaptive routing across specialist model families. The router
supports trending, range, volatility, breakout, mean-reversion, event-driven, panic and
liquidity-stressed states.

Weights are normalized and bounded. A regime-confidence gate prevents normal routing when the
regime is uncertain or liquidity is stressed. This is a decision-support framework, not a claim
that regime classification is perfectly accurate.
