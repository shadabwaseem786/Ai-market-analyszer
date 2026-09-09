// V40800: ensemble diversity contract.
function score(correlations){const a=correlations.filter(Number.isFinite);return a.length?1-a.reduce((s,x)=>s+x,0)/a.length:null}module.exports={score};