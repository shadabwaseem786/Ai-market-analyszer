# V520000 Walk-Forward Protocol

1. Train only on observations available before each test window.
2. Keep test windows strictly out-of-sample.
3. Record model version, feature snapshot, regime and data timestamp.
4. Evaluate classification/regression and trading metrics separately.
5. Track calibration (Brier/ECE) and drift.
6. Compare champion vs challenger on identical out-of-sample windows.
7. Never promote a challenger solely because of in-sample performance.
