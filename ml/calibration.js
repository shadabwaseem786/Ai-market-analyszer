// V20200: probability calibration diagnostics.
function brier(predictions){
 const v=predictions.filter(x=>Number.isFinite(x.probability)&&Number.isFinite(x.actual));
 if(!v.length)return null;
 return v.reduce((s,x)=>s+(x.probability-x.actual)**2,0)/v.length;
}
function reliability(predictions,bins=10){
 const out=[];for(let k=0;k<bins;k++){const lo=k/bins,hi=(k+1)/bins,v=predictions.filter(x=>x.probability>=lo&&x.probability<hi);if(v.length)out.push({bin:k,count:v.length,predicted:v.reduce((s,x)=>s+x.probability,0)/v.length,actual:v.reduce((s,x)=>s+x.actual,0)/v.length})}return out;
}
module.exports={brier,reliability};
