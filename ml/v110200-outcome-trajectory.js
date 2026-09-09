// V110200 historical analogue outcome trajectory.
function trajectory(matches=[]){
 const usable=matches.filter(x=>Number.isFinite(Number(x.outcome))).map(x=>Number(x.outcome)); if(!usable.length)return {version:"V110200",status:"INSUFFICIENT"};
 const mean=usable.reduce((a,b)=>a+b,0)/usable.length, positive=usable.filter(x=>x>0).length;
 return {version:"V110200",samples:usable.length,meanOutcome:+mean.toFixed(3),positiveRate:+(positive/usable.length*100).toFixed(1),dispersion:+(Math.max(...usable)-Math.min(...usable)).toFixed(3)};
}
module.exports={trajectory};