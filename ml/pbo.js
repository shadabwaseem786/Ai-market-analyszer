// V21700: probability of backtest overfitting scaffold.
// Requires a matrix of OOS scores across strategies/folds.
function rank(values){return values.map((v,i)=>({i,v:Number(v)||0})).sort((a,b)=>b.v-a.v)}
function score(matrix){const flat=matrix.flat().filter(Number.isFinite);if(!flat.length)return null;const r=rank(flat);return {observations:flat.length,best:r[0],method:"CSCV/PBO-ready",warning:"compute PBO from independent combinatorial train/test paths before promotion"}}
module.exports={score};
