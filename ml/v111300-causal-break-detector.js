// V111300 causal-break detector for regime/catalyst transitions.
function detect(x={}){
 const breaks=[];
 if(Number(x.regimeChange)>=70)breaks.push("REGIME_BREAK");
 if(Number(x.catalystChange)>=70)breaks.push("CATALYST_BREAK");
 if(Number(x.liquidityChange)>=70)breaks.push("LIQUIDITY_BREAK");
 if(Number(x.breadthChange)>=70)breaks.push("BREADTH_BREAK");
 return {version:"V111300",breaks,severity:breaks.length>=2?"HIGH":breaks.length?"MEDIUM":"LOW",invalidatePrior:breaks.length>=2};
}
module.exports={detect};