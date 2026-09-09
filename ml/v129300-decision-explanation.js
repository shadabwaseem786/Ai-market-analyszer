// V129300 auditable decision explanation.
function explain(decision={}){
 const f=decision.factors||{}, ranked=Object.entries(f).filter(([,v])=>v!==null).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]));
 return {version:"V129300",action:decision.action||"WAIT",bullishDrivers:ranked.filter(([,v])=>v>0).slice(0,5),bearishDrivers:ranked.filter(([,v])=>v<0).slice(0,5),conflicts:decision.conflicts||0,coverage:decision.coverage||0};
}
module.exports={explain};