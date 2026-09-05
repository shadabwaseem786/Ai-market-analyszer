# V18400 — Historical AI Training Plan

## Model stack
1. Logistic regression baseline.
2. Gradient-boosted trees.
3. Random forest baseline.
4. MLP neural network.
5. Temporal model only after leakage-safe sequence construction.
6. Probability calibration.
7. Ensemble selected on validation data only.

## Training protocol
- Chronological split only.
- Purge overlapping label windows.
- Embargo around validation/test boundaries.
- Normalize/fit transforms on training data only.
- Keep a completely untouched final test period.
- Evaluate separately for NIFTY, BANKNIFTY and FINNIFTY.
- Evaluate separately by volatility/regime.
- Include transaction costs and slippage before declaring a strategy viable.

## Self-learning policy
Online adaptation may update calibration and model weights only from observations whose outcome horizon has fully elapsed. Maintain model version, feature hash, timestamp, prediction, probability, realized outcome and drift statistics.

## Deployment gate
A model cannot replace the current engine unless it beats the baseline on unseen walk-forward periods, remains calibrated, survives 2x/3x cost stress, and shows no material feature leakage or regime-specific collapse.
