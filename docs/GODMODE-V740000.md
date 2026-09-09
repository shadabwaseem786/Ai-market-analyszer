# V740000 — Options Surface AI + True Filtered Dashboard

Adds options volatility-surface intelligence, IV rank/percentile, skew, term structure,
realized-vs-implied volatility, gamma exposure, gamma flip, expiry pressure, PCR decomposition,
option-chain anomaly flags and Oracle fusion interfaces.

UI correction: the instrument filter is now designed as a TRUE filter on the main market table.
The control bar is inserted directly before the first market table, the same table is filtered in
place, duplicate legacy filter panels are removed, and the selected filter persists locally.

Supported filters:
ALL | INDICES | STOCKS | STOCK F&O | INDEX F&O | OPTIONS | FUTURES | ETFs

The implementation is data-source agnostic; live option-surface/GEX values require live chain data.
