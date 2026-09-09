// V123200 regime confidence and ambiguity.
function score(x={}){
 const evidence=Array.isArray(x.evidence)?x.evidence.map(Number).filter(Number.isFinite):[];
 const mean=evidence.length?evidence.reduce((a,b)=>a+b,0)/evidence.length:0;
 const dispersion=evidence.length?Math.sqrt(evidence.reduce((a,b)=>a+(b-mean)**2,0)/evidence.length):100;
 return {version:"V123200",confidence:+Math.max(0,Math.min(100,mean-dispersion*.5)).toFixed(2),ambiguity:+Math.min(100,dispersion).toFixed(2)};
}
module.exports={score};