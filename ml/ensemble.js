// V19800: probability ensemble with disagreement penalty.
function combine(predictions){
 const p=predictions.map(Number).filter(Number.isFinite);if(!p.length)return null;
 const mean=p.reduce((a,b)=>a+b,0)/p.length;
 const spread=Math.sqrt(p.reduce((s,x)=>s+(x-mean)**2,0)/p.length);
 const confidence=Math.max(0,Math.min(1,1-spread*2));
 return {probability:mean,spread,confidence,models:p.length};
}
module.exports={combine};
