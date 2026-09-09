// V25300: OOS metrics contract.
function metrics(rows){const a=rows.filter(x=>Number.isFinite(x.ret)),n=a.length;if(!n)return null;const mean=a.reduce((s,x)=>s+x.ret,0)/n;return {samples:n,meanReturn:mean,winRate:a.filter(x=>x.ret>0).length/n}}
module.exports={metrics};