# V610000 Point-in-Time Replay
Historical replay reconstructs the information set available at each event timestamp.
Features must never read observations that occurred after the decision timestamp.
This keeps backtests compatible with live event-time semantics.
