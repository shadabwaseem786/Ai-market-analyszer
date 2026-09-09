// V92400: liquidity-aware signal modifier.
function modifier(liquidity){const x=Math.max(0,Math.min(1,Number(liquidity)||0));return .5+.5*x}module.exports={modifier};