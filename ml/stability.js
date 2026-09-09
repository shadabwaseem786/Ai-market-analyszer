// V21800: performance stability analysis across folds.
function stability(folds){const a=folds.map(x=>Number(x.accuracy)).filter(Number.isFinite);if(!a.length)return null;const mean=a.reduce((s,x)=>s+x,0)/a.length;const sd=Math.sqrt(a.reduce((s,x)=>s+(x-mean)**2,0)/Math.max(1,a.length-1));return {folds:a.length,mean,sd,min:Math.min(...a),max:Math.max(...a),stable:sd<.05&&Math.min(...a)>=.5}}
module.exports={stability};
