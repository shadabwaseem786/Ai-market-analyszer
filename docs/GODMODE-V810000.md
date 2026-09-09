# V810000 — Deep Market Microstructure & Order-Flow Intelligence

Adds bid/ask imbalance, volume delta, VWAP deviation, absorption and exhaustion detection,
liquidity behavior proxies, market-impact estimation, opening/closing auction context and a
microstructure fusion layer.

Liquidity-cancellation patterns are explicitly treated as proxies, not proof of spoofing or hidden
orders. Real order-book/tick feeds are required for live calculations.
