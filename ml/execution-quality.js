// V39700: execution-quality research metrics.
function slippage(expected,actual){if(!Number.isFinite(expected)||!Number.isFinite(actual))return null;return actual-expected}module.exports={slippage};